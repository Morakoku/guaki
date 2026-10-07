import fs from 'node:fs';
import path from 'node:path';

export function readPrivateConfig(file) {
  try {
    return Object.fromEntries(fs.readFileSync(file, 'utf8').split(/\r?\n/).flatMap(line => {
      const match=line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);if(!match)return [];
      let value=match[2].trim();if(['"',"'"].includes(value[0])&&value.at(-1)===value[0])value=value.slice(1,-1);
      return [[match[1],value]];
    }));
  } catch { return {}; }
}

export function createServiceMonitor({configRoot,fetchImpl=fetch,now=()=>Date.now()}) {
  let snapshot=null,pending=null;
  const gatewayUrl='http://127.0.0.1:2785/api';
  async function get(url,headers={}) {
    try {
      const response=await fetchImpl(url,{headers,signal:AbortSignal.timeout(3500),redirect:'error'});
      if(!response.ok)return {ok:false,code:response.status,reason:[401,403].includes(response.status)?'access_denied':'http_error'};
      const data=await response.json();return {ok:true,code:response.status,data:data?.data??data};
    }catch{return {ok:false,code:0,reason:'unavailable_or_invalid_response'};}
  }
  async function collect() {
    const configs={guaki:readPrivateConfig(path.join(configRoot,'guaki-worker.env')),veyra:readPrivateConfig(path.join(configRoot,'veyra-worker.env'))};
    const health=await get(gatewayUrl+'/health',{'X-API-Key':configs.veyra.OPENWA_API_KEY||configs.guaki.OPENWA_API_KEY||''});
    const gatewayValid=health.ok&&health.data?.status==='ok'&&typeof health.data?.version==='string'&&/^\d+\.\d+\.\d+/.test(health.data.version)&&Number.isFinite(Date.parse(health.data.timestamp));
    const gateway={available:gatewayValid,status:gatewayValid?'verified':health.ok?'identity_not_verified':health.reason,httpStatus:health.code,version:gatewayValid?health.data.version:null,port:2785};
    const brands={};
    await Promise.all(Object.entries(configs).map(async([brand,config])=>{
      const expected=brand==='guaki'?'573229149129':'573204889616';
      const configured=!!config.OPENWA_API_KEY&&/^[a-z0-9_-]{1,128}$/i.test(config.OPENWA_SESSION_ID||'');
      let session={linked:false,status:'not_configured',identityVerified:false};
      if(configured){
        const response=await get(gatewayUrl+'/sessions/'+encodeURIComponent(config.OPENWA_SESSION_ID),{'X-API-Key':config.OPENWA_API_KEY});const s=response.data;
        const identity=response.ok&&s?.id===config.OPENWA_SESSION_ID&&String(s?.phone??'').replace(/\D/g,'')===expected;
        const linked=identity&&s.status==='ready'&&s.engineLoaded===true&&!s.restriction;
        const pairing=response.ok&&s?.id===config.OPENWA_SESSION_ID&&!s.phone&&['qr_ready','pairing'].includes(s.status);
        session={linked,identityVerified:identity,status:!response.ok?response.reason:pairing?'pairing_required':!identity?'identity_not_verified':linked?'linked':'not_ready'};
      }
      // Guaki's worker has no host port in Compose. Do not claim it is down
      // solely because 3002 is unpublished. Session inspection remains direct.
      let worker={available:null,status:'not_exposed_to_host',port:null};
      let attention={enabled:null,status:'not_verified'};
      if(brand==='veyra'){
        worker={available:false,status:'not_configured',port:3003};
        if(config.VEYRA_BRIDGE_TOKEN){
          const response=await get('http://127.0.0.1:3003/health',{'X-Veyra-Bridge-Key':config.VEYRA_BRIDGE_TOKEN});const s=response.data;
          const identity=response.ok&&typeof s?.transport==='string'&&s.transport.toLowerCase()==='openwa'&&s.sessionId===config.OPENWA_SESSION_ID&&String(s.expectedNumber??'').replace(/\D/g,'')===expected;
          worker={available:identity,status:identity?'verified':response.ok?'identity_not_verified':response.reason,port:3003,connected:identity&&typeof s.connected==='boolean'?s.connected:null};
          // Existing health contract does not report effective reply policy.
          // Configuration is descriptive, never evidence of runtime enablement.
          attention={enabled:identity&&typeof s.repliesEnabled==='boolean'?s.repliesEnabled:null,status:identity&&typeof s.repliesEnabled==='boolean'?(s.repliesEnabled?'enabled':'disabled'):'not_verified',configured:config.VEYRA_SHIM_ENABLE_REPLIES==='true'};
        }
      }
      brands[brand]={transport:'OpenWA',gateway,session,worker,attention};
    }));
    return {checkedAt:new Date(now()).toISOString(),staleAfterSeconds:30,gateway,brands};
  }
  return async ({force=false}={})=>{
    if(!force&&snapshot&&now()-Date.parse(snapshot.checkedAt)<10000)return snapshot;
    if(!pending)pending=collect().then(value=>{snapshot=value;return value;}).finally(()=>{pending=null;});
    return pending;
  };
}
