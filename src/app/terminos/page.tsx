import type { Metadata } from 'next';
import React from 'react';
import GuakiHeader from '@/components/ui/GuakiHeader';
import LegalDoc from '@/components/ui/LegalDoc';
import { TOKENS } from '@/lib/design-tokens';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Términos y Condiciones del Servicio | Guaki',
  description:
    'Reglas de uso del directorio Guaki para comerciantes y visitantes en Colombia y Venezuela: planes, verificación, responsabilidades y cancelación.',
  alternates: { canonical: absoluteUrl('/terminos') },
};

export default function TerminosPage() {
  return (
    <div className="page-fade-in" style={{ minHeight: '100vh', backgroundColor: 'transparent', color: TOKENS.colors.textMain }}>
      <GuakiHeader />
      <LegalDoc
        title="Términos y Condiciones del Servicio"
        updated="11 de septiembre de 2026"
        intro="Estos términos regulan el uso de Guaki por parte de comerciantes y visitantes. Al crear una cuenta o utilizar el directorio, aceptas las condiciones descritas a continuación."
        sections={[
          {
            heading: '1. Qué es Guaki',
            paragraphs: [
              'Guaki es un directorio digital que conecta a visitantes con negocios y profesionales locales en Colombia y Venezuela. Guaki no presta los servicios ofrecidos por los comercios ni interviene en la relación entre el comerciante y el cliente: el contacto ocurre directamente por WhatsApp, llamada o los canales que el negocio publique, sin comisiones por transacción.',
            ],
          },
          {
            heading: '2. Planes y precios',
            paragraphs: ['Guaki ofrece planes gratuitos y de pago según el mercado:'],
            bullets: [
              'Plan Esencial: $0, con tarjeta de presentación en el directorio y botón directo de WhatsApp.',
              'Plan Verificado: en Colombia $49.900 COP/mes; en Venezuela USD 12,9/mes. Incluye insignia de verificación, ficha web propia, horarios, módulo de reseñas y prioridad en resultados.',
              'Plan VIP Elite: en Colombia $149.900 COP/mes; en Venezuela USD 39,9/mes. Incluye posicionamiento destacado, súper botón VIP y panel de métricas.',
            ],
          },
          {
            heading: '3. Cuenta de comerciante',
            paragraphs: [
              'Para publicar una ficha debes crear una cuenta con información veraz y mantenerla actualizada. Eres responsable de la exactitud de los datos de tu negocio, de contar con autorización para publicar los contenidos que subas y de cumplir la normativa aplicable a tu actividad.',
            ],
          },
          {
            heading: '4. Verificación y auditoría',
            paragraphs: [
              'La insignia "Verificado por Guaki" se otorga tras un proceso de auditoría que puede incluir la comprobación del registro legal y tributario (RUT en Colombia, RIF en Venezuela), la ubicación física y la respuesta en los canales de contacto. Guaki puede rechazar, suspender o retirar la insignia y la ficha si la información no es verificable o incumple estos términos.',
            ],
          },
          {
            heading: '5. Conducta y contenido',
            paragraphs: ['No está permitido:'],
            bullets: [
              'Publicar información falsa, engañosa o suplantar la identidad de terceros.',
              'Ofrecer servicios ilegales o contenido que vulnere derechos de propiedad intelectual.',
              'Usar el directorio para spam, fraude o captación engañosa de clientes.',
            ],
          },
          {
            heading: '6. Propiedad intelectual',
            paragraphs: [
              'La marca, el diseño y el software de Guaki pertenecen a sus titulares. Al publicar contenido en tu ficha (textos, fotos, logo), otorgas a Guaki una licencia para mostrarlo dentro del directorio en cualquier formato o canal de difusión del servicio.',
            ],
          },
          {
            heading: '7. Disponibilidad y responsabilidad',
            paragraphs: [
              'Guaki se ofrece "tal cual" y no garantiza resultados comerciales específicos. Trabajamos por mantener el servicio disponible, pero pueden existir interrupciones por mantenimiento o causas externas. En la medida permitida por la ley, Guaki no responde por daños indirectos derivados del uso del directorio o de la relación entre comerciantes y clientes.',
            ],
          },
          {
            heading: '8. Cancelación y eliminación',
            paragraphs: [
              'Puedes cancelar tu plan o solicitar la eliminación de tu ficha en cualquier momento escribiendo a contacto@guaki.online. Los pagos realizados por periodos ya iniciados no son reembolsables salvo lo exigido por la ley.',
            ],
          },
          {
            heading: '9. Ley aplicable',
            paragraphs: [
              'Estos términos se rigen por la ley colombiana, sin perjuicio de las normas de protección al consumidor que resulten aplicables en Venezuela para los usuarios de ese mercado. Ante cualquier controversia, buscaremos primero una solución directa y de buena fe a través de contacto@guaki.online.',
            ],
          },
        ]}
      />
    </div>
  );
}
