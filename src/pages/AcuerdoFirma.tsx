import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AcuerdoFirma: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-green-600 hover:text-green-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Acuerdo de Firma
          </h1>
          <p className="text-gray-600">
            Plataforma de Negocios Virtuales "FINDII.CO"
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            <p><strong>TÉRMINOS DE USO DE LA PLATAFORMA DE NEGOCIOS VIRTUALES "FINDII.CO"</strong></p>
            <p><strong>«Este servicio de crédito lo presta FINDII.CO por favor lee los términos y condiciones a continuación»</strong></p>
            <p><strong>INTRODUCCIÓN</strong></p>
            <p>Los Términos de Uso de la plataforma de negocios virtuales <strong>"FINDII.CO"</strong> incorporan un verdadero Acuerdo Legal acerca de las reglas a las que voluntariamente se adhieren los "usuarios web" del portal.</p>
            <p>Teniendo en cuenta lo anterior y a efecto de que no quede ninguna duda sobre el contenido y alcance de los mismos, se les solicita a todos los usuarios web leer, atentamente y en su integridad, el contenido del presente documento virtual antes de empezar a utilizar el sitio web y previo a facilitar cualquier tipo de información personal a los administradores del mismo.</p>
            <p>La utilización de la plataforma se configura a través de la aceptación expresa e inequívoca de los términos de uso y de manejo de la información por parte de <strong>EL PROVEEDOR</strong> de la plataforma, así como el registro de los usuarios a la web.</p>
            <p>La aceptación del presente documento es una decisión informada acerca del alcance de las reglas en él contenidas y por lo mismo constituye una verdadera manifestación de consentimiento, plena, previa y expresa, con plenos efectos legales de aceptación de las reglas y condiciones de uso de la plataforma informática, así como del manejo de la información entregada a la misma.</p>
            <p><strong>SI USTED NO ESTÁ DE ACUERDO CON EL CONTENIDO Y ALCANCE DEL PRESENTE DOCUMENTO VIRTUAL, POR FAVOR ABSTÉNGASE DE UTILIZAR Y/O SUMINISTRAR INFORMACIÓN A LOS ADMINISTRADORES DE LA PLATAFORMA VIRTUAL DE NEGOCIOS "FINDII.CO".</strong></p>

            <p><strong>OBJETO</strong></p>
            <p>El objeto del presente documento que incorpora los <strong>"TÉRMINOS DE USO O ACUERDO INNOMINADO DE USO DE LA PLATAFORMA DE NEGOCIOS VIRTUALES DENOMINADA FINDII.CO"</strong>, en adelante y para los efectos del presente instrumento <strong>"los Términos de Uso"</strong>, <strong>"los Términos", "el Acuerdo de Uso"</strong> o simplemente <strong>"el Acuerdo"</strong>, es establecer los términos y condiciones de uso de la plataforma, así como los derechos y obligaciones correlativas de cada una de las partes en lo que se refiere, exclusivamente, al uso de la misma, con total independencia de la suerte final de los negocios que de su utilización de deriven, los cuales, por su naturaleza, por disposición de las partes y por expresa e inequívoca disposición de los Términos de Uso, se encuentran por fuera del ámbito del presente Acuerdo.</p>

            <p><strong>PARTES</strong></p>
            <p>Serán consideradas <strong>PARTES</strong> para los efectos del presente instrumento y exclusivamente en lo referente al uso de la plataforma, las siguientes:</p>
            <ol>
              <li><strong>EL PROVEEDOR DE LA PLATAFORMA O SIMPLEMENTE "EL PROVEEDOR"</strong>. Que es la sociedad comercial colombiana denominada <strong>"FINDII S.A.S."</strong>, con Número de Identificación Tributaria 901436339-1, cuyo domicilio social está ubicado en la ciudad de Barranquilla, República de Colombia, en la Carrera 53 no. 80 – 198 piso 20, firma que es la única y exclusiva propietaria y titular del pleno derecho de dominio y propiedad sobre la plataforma virtual de negocios y página web denominada <strong>www.findii.co</strong>, y sobre todos los derechos y bienes materiales o inmateriales accesorios a la misma, incluidos pero sin limitarse a: su nombre comercial, marca, sigla, signos distintivos, diseño, estructura y distribución, textos y contenidos, logotipos, botones, imágenes, dibujos, nombres comerciales, códigos fuente, elementos creativos, así como cualquiera y todos los derechos de propiedad intelectual e industrial con ella relacionados.</li>
              <li><strong>EL DEMANDANTE DE BIENES Y/O SERVICIOS O SIMPLEMENTE "EL DEMANDANTE O LOS DEMANDANTES"</strong>. Que es la persona natural o jurídica, nacional o extranjera, singular o plural, que requiere de la prestación de un servicio o el suministro de un bien y que utiliza la plataforma virtual para satisfacer dichas necesidades comprometiéndose a respetar los presentes Términos de Condiciones de Uso y la propiedad que de la plataforma y sus accesorios tiene y ejerce <strong>EL PROVEEDOR</strong>.</li>
              <li><strong>EL OFERENTE DE BIENES Y/O SERVICIOS O SIMPLEMENTE "EL OFERENTE O LOS OFERENTES"</strong>. Que es la persona natural o jurídica, nacional o extranjera, singular o plural, que ofrece la prestación de un servicio o el suministro de un bien y que utiliza la plataforma para ofrecer su solución a las necesidades planteadas por <strong>LOS DEMANDANTES</strong>, comprometiéndose a respetar los presentes Términos de Condiciones de Uso y la propiedad que de la plataforma y sus accesorios tiene y ejerce <strong>EL PROVEEDOR</strong>.</li>
            </ol>

            <p><strong>CAPACIDAD LEGAL DE LOS USUARIOS WEB</strong></p>
            <p><strong>"FINDII.CO"</strong>, es una plataforma virtual de negocios que puede ser usada por cualquier persona natural o jurídica, nacional o extranjera, singular o plural, siempre que cuenten con capacidad legal para ejecutar actos jurídicos por su propia cuenta y riesgo o a través de sus representantes debidamente autorizados por sus estatutos o la ley. En tal sentido y en lo que se refiere a personas naturales, éstas deben ser mayores de edad (para efectos de la ley colombiana, tener 18 años cumplidos) y contar con plena capacidad jurídica. Por consiguiente, los menores de esta edad no están autorizados a utilizar la plataforma y no deberán, por tanto, utilizar los servicios de la misma.</p>

            <p><strong>ALCANCE DEL OBJETO Y OBLIGACIONES DE EL PROVEEDOR</strong></p>
            <p><strong>EL PROVEEDOR</strong> se obliga para con las partes, en forma general, a lo siguiente:</p>
            <p>Poner a disposición de ellas una plataforma virtual de negocios que suministre a <strong>Los Aliados</strong> los datos de contacto de <strong>LOS DEMANDANTES</strong> que sean de interés de los Aliados, sobre la base de la información de necesidades de bienes y/o servicios y datos de contacto, entregada a la plataforma por estos últimos.</p>

            <p><strong>EXCLUSIONES DEL OBJETO Y DE LAS CORRESPONDIENTES RESPONSABILIDADES DEL PROVEEDOR EN RELACIÓN CON EL MISMO</strong></p>
            <p>Son exclusiones del objeto y de las correspondientes responsabilidades que del mismo se podrían derivar para <strong>EL PROVEEDOR</strong>, sin limitarse a ellas, las siguientes:</p>

            <p><strong>EXCLUSIÓN EN RAZÓN DE LA NATURALEZA DE LAS PARTES QUE INTERVIENEN EN LA CELEBRACIÓN DE LOS ACTOS.</strong> A la luz de lo establecido en los acápites de <strong>"OBJETO"</strong> y <strong>"ALCANCE DEL OBJETO Y OBLIGACIONES DE EL PROVEEDOR"</strong>, los usuarios web, bien sean <strong>DEMANDANTES</strong> u <strong>OFERENTES</strong>, al momento de aceptar el presente Acuerdo y por lo mismo al asumir como regla de uso de la plataforma los presentes Términos de Uso, entienden y aceptan en forma expresa e inequívoca que <strong>EL PROVEEDOR</strong>, en ningún caso actúa asumiendo posición propia de ninguna especie y tampoco ostenta la calidad de corredor o intermediario comercial de ninguna índole frente a los eventuales negocios que lleguen a realizar <strong>LOS DEMANDANTES</strong> y <strong>LOS OFERENTES</strong> entre ellos o con cualquier tercero.</p>

            <p><strong>EXCLUSIÓN EN RAZÓN DE LA CALIDAD DE LA INFORMACIÓN.</strong></p>
            <p><strong>EL PROVEEDOR</strong> no se responsabiliza por los daños y perjuicios de cualquier naturaleza que se puedan derivar de la falta de exactitud y exhaustividad, así como de errores u omisiones en las informaciones contenidas en la plataforma y que hayan sido entregadas por los usuarios web, así como por cualquier otro contenido al que se pueda acceder directa o indirectamente a través del portal, ni asume ningún deber o compromiso de verificar ni de vigilar el contenido y/o la trazabilidad de las informaciones suministradas por los usuarios web quienes, por una parte, deben obrar de buena fe de conformidad con la constitución y las leyes.</p>

            <p><strong>EXCLUSIÓN EN RAZÓN DEL FUNCIONAMIENTO DE LA PLATAFORMA Y SUS SERVICIOS ACCESORIOS.</strong></p>
            <p>Sin perjuicio del hecho que <strong>EL PROVEEDOR</strong> desplegará su mejor esfuerzo a efecto de diseñar, poner en marcha, operar y mantener una plataforma virtual de negocios de calidad, los usuarios web entienden y aceptan expresa e inequívocamente que <strong>las obligaciones de EL PROVEEDOR son de medio y no de resultado y por lo mismo éste no garantiza la disponibilidad y continuidad del funcionamiento del portal y sus servicios</strong>.</p>

            <p><strong>DECLARACIÓN GENERAL DE EXONERACIÓN DE RESPONSABILIDAD</strong></p>
            <p>Teniendo en cuenta lo recién expuesto y que cualquier negocio que se realice entre <strong>EL DEMANDANTE</strong> y <strong>EL OFERENTE</strong>, de conformidad con los presentes Términos de Uso, es por completo ajeno a EL PROVEEDOR, éstos, es decir, tanto <strong>EL DEMANDANTE</strong> como <strong>EL OFERENTE</strong>, por virtud de la aceptación de los citados Términos, <strong>EXIMEN EN FORMA ABSOLUTAMENTE CLARA, EXPRESA E INEQUÍVOCA a EL PROVEEDOR, DE CUALQUIER TIPO DE RESPONSABILIDAD DERIVADA DE LOS ACTOS JURÍDICOS MERCANTILES, CIVILES O DE CUALQUIER OTRO TIPO QUE CELEBREN ENTRE ELLOS</strong>.</p>

            <p><strong>RENUNCIA A LA INTERPOSICIÓN DE DEMANDAS Y/O RECLAMACIONES JUDICIALES O EXTRAJUDICIALES</strong></p>
            <p>Por virtud del perfeccionamiento del presente Acuerdo a través de la aceptación de los Términos de Uso incorporados en este documento virtual y habida cuenta del principio legal de la relatividad de los actos jurídicos, <strong>EL DEMANDANTE</strong> y <strong>EL OFERENTE</strong>, reconociendo que los negocios que acuerden y ejecuten entre ellos son por completo ajenos a la órbita de actuación de <strong>EL PROVEEDOR, DECLARAN, EN FORMA PREVIA, EXPRESA E INEQUÍVOCA, QUE RENUNCIAN EN FORMA IRREVOCABLE A ELEVAR, PRESENTAR O PROMOVER ACCIONES, DEMANDAS O RECLAMACIONES DE CUALQUIER ÍNDOLE, JUDICIALES O EXTRAJUDICIALES, EN CONTRA DE EL PROVEEDOR, CON OCASIÓN O DERIVADAS DE LOS NEGOCIOS QUE CELEBREN O EJECUTEN ENTRE ELLOS.</strong></p>

            <p><strong>DERECHOS Y OBLIGACIONES GENERALES DE LOS DEMANDANTES</strong></p>
            <p><strong>LOS DEMANDANTES</strong> tienen como derecho principal la facultad de publicar, a través de la plataforma, sus necesidades o requerimientos de bienes y/o servicios, lo cual apareja para ellos la carga de seriedad que se traduce en que se trate, sin limitarse a ellas, de solicitudes verídicas, reales, actuales, lícitas y posibles.</p>

            <p><strong>DERECHOS Y OBLIGACIONES GENERALES DE LOS OFERENTES</strong></p>
            <p><strong>LOS OFERENTES</strong> tienen como derecho principal la facultad de recibir, a través de la plataforma, las necesidades o requerimientos de bienes y/o servicios informados a la plataforma por parte de <strong>LOS DEMANDANTES</strong> y, en el evento de requerirlo <strong><em>y pagarlo</em></strong>, recibir los datos de contacto suministrados a la plataforma por parte de <strong>LOS DEMANDANTES</strong>, lo cual apareja para <strong>LOS OFERENTES</strong> la correspondiente carga de seriedad, que se traduce en entregarle a la plataforma información verídica, real, actual, lícita y posible sobre los servicios que ofrece.</p>

            <p><strong>OBLIGACIONES LEGALES PARA DEMANDANTES Y OFERENTES</strong></p>
            <p>Tanto <strong>LOS DEMANDANTES</strong> como <strong>LOS OFERENTES</strong> de bienes y servicios que utilicen la plataforma web, según sea quienes entreguen o reciban la información, tendrán radicadas en su cabeza las obligaciones establecidas para los titulares, las fuentes y los usuarios de la información contenidas en la Ley Estatutaria 1266 del 31 de diciembre de 2008 de la República de Colombia.</p>

            <p><strong>REGISTRO DE USUARIOS WEB</strong></p>
            <p>El perfeccionamiento del presente Acuerdo a través de la aceptación de los Términos de Uso incorporados en este documento, así como el registro de cada uno de los usuarios web, bien sean éstos <strong>DEMANDANTES</strong> u <strong>OFERENTES</strong>, constituyen verdaderas condiciones suspensivas para la utilización de los servicios de la plataforma. A efecto de que cualquier usuario web se entienda registrado debe, como mínimo, suministrar todos y cada uno de los datos de inscripción que se le exijan para tal propósito en el formato o instrumento de registro.</p>

            <p><strong>RESPONSABLE DE LA INFORMACIÓN SUMINISTRADA EN EL REGISTRO</strong></p>
            <p><strong>Cada usuario web es el único responsable por la información que suministre</strong> durante y con ocasión del proceso de inscripción y registro, así como por cualquier otra que entregue durante el lapso que dure su uso de la plataforma.</p>

            <p><strong>CARGA DE ACTUALIZACIÓN DE LA INFORMACIÓN</strong></p>
            <p><strong>Cada usuario web es el único responsable de conservar actualizada su propia</strong> información y en tal sentido tiene la carga de comunicar a <strong>EL PROVEEDOR</strong> cualquier modificación de la misma, así como la de mantener ésta al día, de tal forma que corresponda en cada momento puntual a la realidad.</p>

            <p><strong>ACCESO, RECTIFICACIÓN Y/O CANCELACIÓN DE LA INFORMACIÓN ENTREGADA POR LOS USUARIOS WEB</strong></p>
            <p>Todos los usuarios web podrán ejercer sus derechos de acceso, rectificación y/o cancelación de la información entregada al portal. Para efectuar modificaciones, correcciones o la eliminación de la citada información, <strong>EL PROVEEDOR</strong> dispondrá, como accesorio a la plataforma tecnológica, de un correo electrónico dispuesto para tal fin.</p>

            <p><strong>CARÁCTER DE LA INFORMACIÓN ENTREGADA AL PORTAL</strong></p>
            <p>Cada usuario web entiende y acepta, en forma absolutamente clara, expresa e inequívoca que toda y cualquier parte de la información que entregue a la plataforma virtual a través de <strong>EL PROVEEDOR</strong> podrá ser publicada y no tendrá en ningún caso el carácter de confidencial o reservada.</p>

            <p><strong>AUTORIZACIÓN EXPRESA DE ENTREGA DE DATOS DE CONTACTO</strong></p>
            <p>Como desarrollo puntual de la facultad de utilización comercial de la información entregada al portal por parte de los usuarios web y sin limitarse a ello, <strong>EL DEMANDANTE</strong>, con la aceptación de los presentes <strong>Términos de Uso, autoriza en forma absolutamente clara, expresa e inequívoca a EL PROVEEDOR para entregarle, a cualquier OFERENTE, los datos de contacto que ha registrado en el portal al momento de su inscripción, los cuales, además, debe actualizar según lo señalado en este Acuerdo.</strong></p>

            <p><strong>RESPONSABILIDAD POR EL USO DEL NOMBRE Y/O CUALQUIER OTRO SÍMBOLO DISTINTIVO</strong></p>
            <p>El usuario web se compromete a conservar y proteger, con el mayor grado de cuidado y diligencia, su nombre legal, usuario web y contraseña (cuando éstos estén habilitados) y a mantenerlos libres de manipulación, así como a usarlos con la seriedad debida.</p>

            <p><strong>DERECHO DE ADMISIÓN, SUSPENSIÓN Y ELIMINACIÓN DE USUARIOS WEB</strong></p>
            <p>Al aceptar los Términos de Uso contenidos en este escrito, los usuarios web manifiestan en forma expresa e inequívoca que están de acuerdo con que <strong>EL PROVEEDOR</strong> se reserve, lo cual en efecto hace, la facultad absolutamente discrecional de admitir, suspender, eliminar o cancelar, cualquier solicitud de servicios, inscripción o registro efectuado por los usuarios web o por quienes aspiren a serlo.</p>

            <p><strong>INFORMACIÓN DE IRREGULARIDADES</strong></p>
            <p>Los usuarios web están facultados para informar a <strong>EL PROVEEDOR</strong> acerca de cualquier irregularidad detectada respecto de los demás usuarios web de la plataforma o del funcionamiento de esta última.</p>

            <p><strong>OBLIGACIONES NEGATIVAS RELACIONADAS CON EL "SPAMMING"</strong></p>
            <p>Los usuarios web, en su integridad, se obligan a abstenerse de realizar, a título ilustrativo, pero sin limitarse a ellas, las siguientes conductas:</p>
            <p>1. Investigar y tomar datos de los otros usuarios web para fines publicitarios relacionados con propósitos ajenos a los previstos en el objeto de la plataforma "FINDII.CO".</p>
            <p>2. Poner a disposición de terceros que no ostenten la calidad de usuarios web, con cualquier finalidad, datos tomados de la plataforma de negocios cuya regulación está incluida en los presentes Términos.</p>

            <p><strong>OPINIONES DE LOS USUARIOS WEB</strong></p>
            <p>Los usuarios web podrán manifestarle a <strong>EL PROVEEDOR</strong> sus opiniones <strong>respetuosas</strong> acerca del funcionamiento de la plataforma y de los bienes y/o servicios ofrecidos por <strong>LOS OFERENTES</strong>, sin perjuicio de lo cual, <strong>EL PROVEEDOR</strong>, en ningún caso, es responsable por el cumplimiento de los usuarios web, ni por las opiniones o manifestaciones de sus contrapartes mercantiles, aún si éstas se hicieran a través del portal.</p>

            <p><strong>PROHIBICIÓN DE USO DEL PORTAL PARA ACTOS NO INCLUIDOS EN LOS TÉRMINOS DE USO</strong></p>
            <p>Está prohibida la utilización, de <strong>"FINDII.CO"</strong> para usos diferentes a los establecidos en el presente documento, así mismo se prohíbe su reproducción, explotación, alteración, distribución o la emisión de cualquier comunicación pública referente al portal sin la autorización previa y por escrito de <strong>EL PROVEEDOR</strong>.</p>

            <p><strong>EL USO NO GENERA DERECHO PATRIMONIAL ALGUNO A FAVOR DE LOS USUARIOS WEB</strong></p>
            <p>El uso de la plataforma virtual no genera, en ningún caso, derecho patrimonial alguno al usuario web, quien, al usar la plataforma de propiedad de <strong>EL PROVEEDOR</strong>, reconoce expresamente que no dispone de ningún derecho de propiedad o licencia sobre la misma, el portal y los bienes y derechos que a ella acceden, los cuales son de exclusiva titularidad de <strong>EL PROVEEDOR</strong>.</p>

            <p><strong>FACULTAD DE USO ILIMITADO DE COOKIES E INSTRUMENTOS ANÁLOGOS</strong></p>
            <p>Por virtud del presente Acuerdo y de los Términos de Uso que le dan contenido normativo al mismo, los usuarios web aceptan en forma expresa e inequívoca que <strong>EL PROVEEDOR</strong> está facultado para utilizar cualquiera y todas las cookies e instrumentos análogos a éstas que considere favorables para la operación de la plataforma y que en ningún caso se le hará responsable por los efectos que éstas o aquéllos puedan generar respecto de los usuarios web, su hardware o software.</p>

            <p><strong>POLÍTICA DE MANEJO DE DATOS E INFORMACIÓN ENTREGADA POR PARTE DE LOS USUARIOS WEB</strong></p>
            <p>La aceptación de los Términos de Uso comporta e incluye la aceptación previa y expresa de la política de manejo de datos e información en este documento incluida y muy principalmente de la enunciada, a título ilustrativo, en el presente acápite, por parte de todos los usuarios del portal, registrados o no, quienes desde el mismo momento de entrar a la página por información básica de la misma están entregando su propia información, la cual aceptan que se maneje como pública por parte de <strong>EL PROVEEDOR</strong>.</p>

            <p><strong>FACULTAD GENERAL RELATIVA AL USO DE LA INFORMACIÓN POR PARTE DEL PROVEEDOR</strong></p>
            <p><strong>Por virtud de la aceptación de los presentes Términos de Uso, el usuario web, bien sea DEMANDANTE u OFERENTE autoriza, previa, expresa e inequívocamente a EL PROVEEDOR LA UTILIZACIÓN COMERCIAL DE LA INFORMACIÓN ENTREGADA AL PORTAL SIN LÍMITE ALGUNO.</strong></p>

            <p><strong>ATENCIÓN DE PETICIONES, SOLICITUDES, QUEJAS Y RECLAMOS</strong></p>
            <p><strong>EL PROVEEDOR</strong> gestionará, de conformidad con los medios a su alcance, las peticiones, solicitudes, quejas y reclamos que los usuarios, <strong>en forma respetuosa</strong>, le formulen en relación con los servicios por él prestados a través de la plataforma y sus herramientas accesorias.</p>

            <p><strong>DERECHO DE CORRECCIÓN Y OPOSICIÓN A LA DIVULGACIÓN</strong></p>
            <p>Todos los usuarios, sin excepción y en cualquier tiempo, tendrán derecho de acceso, modificación y rectificación de la información por ellos suministrada. Así mismo tendrán la facultad de oponerse a que sus datos de carácter personal, privado y/o confidencial sean divulgados, para lo cual deberán hacer la manifestación de voluntad clara, expresa, inequívoca y por escrito a <strong>EL PROVEEDOR</strong>.</p>

            <p><strong>ESCENARIOS DE RECOLECCIÓN DE DOCUMENTOS Y SU TRATAMIENTO</strong></p>
            <p>Escenarios de Recolección de documentos:</p>
            <ol>
              <li>Cargue en línea de los documentos: El cliente puede subir sus documentos al aplicativo con el único fin de realizar estudio de crédito con FINDII.CO a través de los bancos aliados.</li>
              <li>Agendar cita para recoger los documentos: El cliente puede solicitar una cita que se ajuste a su horario en la cual debe entregar a uno de nuestros especialistas o personal encargado motorizado los documentos correspondientes para el estudio de crédito con la entidad aliada seleccionada por el cliente.</li>
              <li>Entrega en la oficina: El cliente puede acercarse a la dirección de la oficina suministrada por FINDII.CO, donde puede entregar la documentación y recibir asesoría personalizada sobre su proceso de crédito hipotecario.</li>
            </ol>

            <p><strong>CUSTODIA DE LA INFORMACIÓN</strong></p>
            <p>Sin perjuicio de la facultad general de uso de la información por parte de <strong>EL PROVEEDOR</strong>, éste desplegará su actividad tratando de evitar la alteración, tratamiento, acceso no autorizado, pérdida o mal uso de la información entregada por los usuarios web o el robo de los datos personales entregados por los mismos.</p>

            <p><strong>GRABACIÓN DE COMUNICACIONES</strong></p>
            <p>A fin de mejorar la calidad de los servicios ofrecidos y facilitar la ejecución de los mismos, <strong>EL PROVEEDOR</strong> tendrá derecho de grabar y reproducir todas las comunicaciones que sostenga con los usuarios web, incluyendo, pero sin limitarse a ellas, las llamadas telefónicas, tanto entrantes como salientes, lo cual, con la aceptación de los presentes Términos de Uso, el usuario web desde ahora acepta expresamente.</p>

            <p><strong>INDEPENDENCIA DE LAS PARTES Y AUSENCIA DE VÍNCULO LABORAL</strong></p>
            <p>Todas las partes, incluyendo a la totalidad de los usuarios web actúan con absoluta independencia cuando utilizan los servicios de la plataforma. En atención a lo anterior, los vínculos jurídicos asociados a la citada utilización son de carácter puramente mercantil y no generan, en forma directa, ningún tipo de vínculo laboral.</p>

            <p><strong>CESIÓN DEL ACUERDO Y DE LOS TÉRMINOS DE USO</strong></p>
            <p><strong>EL PROVEEDOR</strong> podrá ceder a su entero arbitrio el presente Acuerdo y los derechos que para él se deriven de los Términos de Uso recogidos en el presente instrumento virtual, facultad que el usuario autoriza y reconoce en forma expresa e inequívoca y con carácter irrevocable, desde el momento en que profiere su aceptación a los presentes Términos.</p>

            <p><strong>DOMICILIO CONTRATUAL</strong></p>
            <p>Para todos los efectos legales el domicilio contractual será la ciudad de Barranquilla, ciudad donde se ubica el domicilio social de <strong>EL PROVEEDOR</strong>.</p>

            <p><strong>NOTIFICACIONES</strong></p>
            <p><strong>EL PROVEEDOR</strong> recibirá las notificaciones relacionadas con el presente instrumento en la ciudad de Barranquilla o a través del correo electrónico: <a href="mailto:comercial@findii.co"><strong>comercial@findii.co</strong></a>, siempre que en cualquiera de los anteriores eventos, haya constancia de su entrega.</p>

            <p><strong>RESOLUCIÓN DE DIFERENCIAS</strong></p>
            <p>Cualquier diferencia que se presente entre los usuarios web y <strong>EL PROVEEDOR</strong> en relación con la ejecución de las obligaciones derivadas del presente Acuerdo y los Términos de Uso o referidos a la prestación de los servicios de la plataforma y que LAS PARTES no puedan resolver de común acuerdo, se resolverá conforme a la Ley 1563 de 2012 por la amigable composición.</p>

            <p><strong>NO COMPETENCIA.</strong></p>
            <p>Los usuarios web se obligan en forma unilateral a no constituirse, directamente o a través de terceras personas, en competencia de <strong>EL PROVEEDOR</strong>. Por lo mismo reconocen expresamente que la información a la que accedan acerca del funcionamiento de la plataforma virtual de negocios es de exclusiva propiedad de <strong>EL PROVEEDOR</strong> y declaran que no la utilizarán para competir en forma alguna con éste.</p>

            <p><strong>FACULTAD DE MODIFICACIÓN UNILATERAL DE LOS TÉRMINOS DE USO</strong></p>
            <p>Por Acuerdo entre las partes, hecho que corrobora el usuario en forma expresa con la aceptación del presente documento virtual, <strong>EL PROVEEDOR</strong> cuenta con la facultad ilimitada de modificar unilateralmente y en cualquier tiempo, el presente Acuerdo y los correspondientes Términos de Uso en él incluidos.</p>

            <p><strong>NORMAS QUE RIGEN LOS TÉRMINOS DE USO</strong></p>
            <p>El presente Acuerdo y los Términos de uso en el incorporados se rigen y se interpretarán en primera instancia por el contenido de este documento virtual y en lo no establecido en el, por las leyes de la República de Colombia, especialmente por lo dispuesto por Ley Estatutaria 1266 del 31 de diciembre de 2008 o las normas que la complementen, modifiquen, sustituyan o deroguen.</p>

            <p><strong>LLAMADO FINAL</strong></p>
            <p><strong>SI USTED COMO USUARIO WEB NO ACEPTA LOS PRESENTES TÉRMINOS DE USO EN ÉL CONTENIDOS, SE LE SOLICITA EN FORMA RESPETUOSA NO UTILIZAR POR NINGÚN MOTIVO LA PLATAFORMA VIRTUAL DENOMINADA FINDII.CO.</strong></p>
            <p><strong>EL SERVICIO OFRECIDO EN VIRTUD DE ESTOS TÉRMINOS Y CONDICIONES ES DE EXCLUSIVA RESPONSABILIDAD DE FINDII.CO.</strong></p>
            <p><strong>COMO CONSECUENCIA DE LO ANTERIOR, SE ADVIERTE A LOS USUARIOS QUE CUALQUIER RECLAMO EN RELACIÓN CON LOS SERVICIOS, DEBERÁ SER PRESENTADO DIRECTAMENTE A FINDII.CO. DE ACUERDO CON LO INFORMADO EN LOS PRESENTES TÉRMINOS Y CONDICIONES.</strong></p>
            <p>De conformidad con lo anterior y una vez leído y aceptado por su propia y libre voluntad la integridad del texto del Acuerdo contentivo de los Términos de Uso de la plataforma virtual de negocios denominada <strong>"FINDII.CO" vigentes a partir de su publicación</strong>, el usuario web procede a su expresa, inequívoca e íntegra <strong>ACEPTACIÓN</strong>, en muestra de lo cual pulsa el link correspondiente a: <strong>ACEPTACIÓN DE LOS TÉRMINOS DE USO</strong> o hace uso en sí de la plataforma en mención, teniendo claro conocimiento de los <strong>TÉRMINOS</strong> aquí descritos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcuerdoFirma;
