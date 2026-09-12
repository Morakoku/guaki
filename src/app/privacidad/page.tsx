import type { Metadata } from 'next';
import React from 'react';
import GuakiHeader from '@/components/ui/GuakiHeader';
import LegalDoc from '@/components/ui/LegalDoc';
import { TOKENS } from '@/lib/design-tokens';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Política de Privacidad y Tratamiento de Datos | Guaki',
  description:
    'Cómo Guaki recopila, usa y protege tus datos en Colombia y Venezuela, conforme a la Ley 1581 de 2012 y la normativa venezolana aplicable.',
  alternates: { canonical: absoluteUrl('/privacidad') },
};

export default function PrivacidadPage() {
  return (
    <div className="page-fade-in" style={{ minHeight: '100vh', backgroundColor: 'transparent', color: TOKENS.colors.textMain }}>
      <GuakiHeader />
      <LegalDoc
        title="Política de Privacidad y Tratamiento de Datos"
        updated="11 de septiembre de 2026"
        intro="En Guaki protegemos la información de comerciantes y visitantes. Esta política explica qué datos tratamos, con qué finalidad, por cuánto tiempo y cómo puedes ejercer tus derechos, tanto si tu negocio está en Colombia como en Venezuela."
        sections={[
          {
            heading: '1. Responsable del tratamiento',
            paragraphs: [
              'Guaki es un directorio digital de negocios locales que opera en Colombia y Venezuela. El responsable del tratamiento es el equipo de Guaki, con canal oficial de contacto: contacto@guaki.online.',
            ],
          },
          {
            heading: '2. Datos que tratamos',
            paragraphs: ['Tratamos únicamente los datos necesarios para operar el directorio:'],
            bullets: [
              'De comerciantes: nombre comercial, categoría, ciudad y dirección, teléfono y WhatsApp, correo electrónico de la cuenta, descripción del negocio, catálogo de servicios, horarios, logo, portada y fotos que decidas publicar.',
              'De visitantes: ciudad aproximada detectada por IP, ubicación precisa solo si autorizas la geolocalización del navegador, y eventos de uso (vistas de ficha, búsquedas y clics al WhatsApp) asociados a un identificador técnico anónimo.',
              'Datos técnicos: cookies de sesión (guaki_session), de ciudad detectada, de atribución de campañas y preferencias locales como tus negocios guardados.',
            ],
          },
          {
            heading: '3. Finalidades',
            paragraphs: ['Usamos los datos para:'],
            bullets: [
              'Publicar y mantener la ficha comercial de tu negocio y permitir que los visitantes te contacten directamente por WhatsApp o llamada.',
              'Medir de forma agregada el uso del directorio (por ejemplo, cuántas personas vieron tu ficha) para mejorar el producto.',
              'Enviarte correos operativos sobre tu cuenta: recibido de auditoría, aprobación, rechazo o recordatorios de tu proceso de verificación.',
              'Prevenir fraude, abuso y usos contrarios a nuestros Términos y Condiciones.',
            ],
          },
          {
            heading: '4. Base legal',
            paragraphs: [
              'En Colombia tratamos los datos conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013. En Venezuela aplicamos la normativa vigente de protección de datos y los principios de la Ley de Infogobierno para tratamientos electrónicos.',
              'La base del tratamiento es la ejecución del servicio que solicitas al crear tu cuenta, tu consentimiento para finalidades específicas (como la geolocalización) y el interés legítimo en la seguridad de la plataforma.',
            ],
          },
          {
            heading: '5. Conservación',
            paragraphs: [
              'Conservamos los datos de tu cuenta mientras esté activa. Si eliminas tu negocio o solicitas la supresión, borraremos tus datos personales en un plazo máximo de 30 días, salvo obligación legal de conservarlos. Las métricas agregadas y anonimizadas pueden conservarse hasta 24 meses para fines estadísticos.',
            ],
          },
          {
            heading: '6. Con quién compartimos datos',
            paragraphs: [
              'No vendemos ni alquilamos datos personales. Usamos proveedores de infraestructura tecnológica (alojamiento y base de datos) que pueden almacenar información en servidores fuera de tu país, con medidas contractuales de seguridad.',
              'Cuando un visitante hace clic en un botón de WhatsApp, la conversación ocurre en WhatsApp y se rige por las políticas de Meta. Guaki no accede al contenido de esas conversaciones.',
            ],
          },
          {
            heading: '7. Tus derechos',
            paragraphs: [
              'Puedes ejercer los derechos de conocer, actualizar, rectificar y suprimir tu información, así como revocar la autorización otorgada, escribiendo a contacto@guaki.online desde el correo de tu cuenta.',
              'También puedes solicitar la desactivación de tu ficha y la eliminación de tu cuenta en cualquier momento. Responderemos tu solicitud en los plazos previstos por la ley aplicable.',
            ],
          },
          {
            heading: '8. Seguridad',
            paragraphs: [
              'Aplicamos medidas técnicas y organizativas razonables: cifrado en tránsito (HTTPS), control de acceso a bases de datos con políticas de seguridad a nivel de fila, revisión de permisos y auditorías periódicas de seguridad.',
            ],
          },
          {
            heading: '9. Menores de edad',
            paragraphs: [
              'Guaki no está dirigido a menores de 14 años y no recopila intencionalmente sus datos. Si identificamos un registro de un menor, procederemos a eliminarlo.',
            ],
          },
          {
            heading: '10. Cambios a esta política',
            paragraphs: [
              'Podemos actualizar esta política para reflejar cambios legales u operativos. Publicaremos la versión vigente en esta misma página con su fecha de actualización.',
            ],
          },
        ]}
      />
    </div>
  );
}
