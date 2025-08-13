import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsAndConditions: React.FC = () => {
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
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-gray-600">
            Plataforma de Negocios Virtuales "FINDII.CO"
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                TÉRMINOS DE USO DE LA PLATAFORMA DE NEGOCIOS VIRTUALES "FINDII.CO"
              </h2>
              <p className="text-lg font-medium text-gray-700 mb-6">
                «Este servicio de crédito lo presta FINDII.CO por favor lee los términos y condiciones a continuación»
              </p>
            </div>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">INTRODUCCIÓN</h3>
              <p className="text-gray-700 mb-4">
                Los Términos de Uso de la plataforma de negocios virtuales <strong>"FINDII.CO"</strong> incorporan un verdadero Acuerdo Legal acerca de las reglas a las que voluntariamente se adhieren los "usuarios web" del portal.
              </p>
              <p className="text-gray-700 mb-4">
                Teniendo en cuenta lo anterior y a efecto de que no quede ninguna duda sobre el contenido y alcance de los mismos, se les solicita a todos los usuarios web leer, atentamente y en su integridad, el contenido del presente documento virtual antes de empezar a utilizar el sitio web y previo a facilitar cualquier tipo de información personal a los administradores del mismo.
              </p>
              <p className="text-gray-700 mb-4">
                La utilización de la plataforma se configura a través de la aceptación expresa e inequívoca de los términos de uso y de manejo de la información por parte de <strong>EL PROVEEDOR</strong> de la plataforma, así como el registro de los usuarios a la web.
              </p>
              <p className="text-gray-700 mb-4">
                La aceptación del presente documento es una decisión informada acerca del alcance de las reglas en él contenidas y por lo mismo constituye una verdadera manifestación de consentimiento, plena, previa y expresa, con plenos efectos legales de aceptación de las reglas y condiciones de uso de la plataforma informática, así como del manejo de la información entregada a la misma.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800 font-medium">
                  <strong>SI USTED NO ESTÁ DE ACUERDO CON EL CONTENIDO Y ALCANCE DEL PRESENTE DOCUMENTO VIRTUAL, POR FAVOR ABSTÉNGASE DE UTILIZAR Y/O SUMINISTRAR INFORMACIÓN A LOS ADMINISTRADORES DE LA PLATAFORMA VIRTUAL DE NEGOCIOS "FINDII.CO".</strong>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">OBJETO</h3>
              <p className="text-gray-700 mb-4">
                El objeto del presente documento que incorpora los <strong>"TÉRMINOS DE USO O ACUERDO INNOMINADO DE USO DE LA PLATAFORMA DE NEGOCIOS VIRTUALES DENOMINADA FINDII.CO"</strong>, en adelante y para los efectos del presente instrumento <strong>"los Términos de Uso"</strong>, <strong>"los Términos", "el Acuerdo de Uso"</strong> o simplemente <strong>"el Acuerdo"</strong>, es establecer los términos y condiciones de uso de la plataforma, así como los derechos y obligaciones correlativas de cada una de las partes en lo que se refiere, exclusivamente, al uso de la misma, con total independencia de la suerte final de los negocios que de su utilización de deriven, los cuales, por su naturaleza, por disposición de las partes y por expresa e inequívoca disposición de los Términos de Uso, se encuentran por fuera del ámbito del presente Acuerdo.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">PARTES</h3>
              <p className="text-gray-700 mb-4">
                Serán consideradas <strong>PARTES</strong> para los efectos del presente instrumento y exclusivamente en lo referente al uso de la plataforma, las siguientes:
              </p>
              <ol className="list-decimal list-inside space-y-4 text-gray-700">
                <li>
                  <strong>EL PROVEEDOR DE LA PLATAFORMA O SIMPLEMENTE "EL PROVEEDOR"</strong>. Que es la sociedad comercial colombiana denominada <strong>"FINDII S.A.S."</strong>, con Número de Identificación Tributaria 901436339-1, cuyo domicilio social está ubicado en la ciudad de Barranquilla, República de Colombia, en la Carrera 53 no. 80 – 198 piso 20, firma que es la única y exclusiva propietaria y titular del pleno derecho de dominio y propiedad sobre la plataforma virtual de negocios y página web denominada <strong>www.findii.co</strong>, y sobre todos los derechos y bienes materiales o inmateriales accesorios a la misma, incluidos pero sin limitarse a: su nombre comercial, marca, sigla, signos distintivos, diseño, estructura y distribución, textos y contenidos, logotipos, botones, imágenes, dibujos, nombres comerciales, códigos fuente, elementos creativos, así como cualquiera y todos los derechos de propiedad intelectual e industrial con ella relacionados.
                </li>
                <li>
                  <strong>EL DEMANDANTE DE BIENES Y/O SERVICIOS O SIMPLEMENTE "EL DEMANDANTE O LOS DEMANDANTES"</strong>. Que es la persona natural o jurídica, nacional o extranjera, singular o plural, que requiere de la prestación de un servicio o el suministro de un bien y que utiliza la plataforma virtual para satisfacer dichas necesidades comprometiéndose a respetar los presentes Términos de Condiciones de Uso y la propiedad que de la plataforma y sus accesorios tiene y ejerce <strong>EL PROVEEDOR</strong>.
                </li>
                <li>
                  <strong>EL OFERENTE DE BIENES Y/O SERVICIOS O SIMPLEMENTE "EL OFERENTE O LOS OFERENTES"</strong>. Que es la persona natural o jurídica, nacional o extranjera, singular o plural, que ofrece la prestación de un servicio o el suministro de un bien y que utiliza la plataforma para ofrecer su solución a las necesidades planteadas por <strong>LOS DEMANDANTES</strong>, comprometiéndose a respetar los presentes Términos de Condiciones de Uso y la propiedad que de la plataforma y sus accesorios tiene y ejerce <strong>EL PROVEEDOR</strong>.
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">CAPACIDAD LEGAL DE LOS USUARIOS WEB</h3>
              <p className="text-gray-700 mb-4">
                <strong>"FINDII.CO"</strong>, es una plataforma virtual de negocios que puede ser usada por cualquier persona natural o jurídica, nacional o extranjera, singular o plural, siempre que cuenten con capacidad legal para ejecutar actos jurídicos por su propia cuenta y riesgo o a través de sus representantes debidamente autorizados por sus estatutos o la ley. En tal sentido y en lo que se refiere a personas naturales, éstas deben ser mayores de edad (para efectos de la ley colombiana, tener 18 años cumplidos) y contar con plena capacidad jurídica.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">ALCANCE DEL OBJETO Y OBLIGACIONES DE EL PROVEEDOR</h3>
              <p className="text-gray-700 mb-4">
                <strong>EL PROVEEDOR</strong> se obliga para con las partes, en forma general, a lo siguiente:
              </p>
              <p className="text-gray-700 mb-4">
                Poner a disposición de ellas una plataforma virtual de negocios que suministre a <strong>Los Aliados</strong> los datos de contacto de <strong>LOS DEMANDANTES</strong> que sean de interés de los Aliados, sobre la base de la información de necesidades de bienes y/o servicios y datos de contacto, entregada a la plataforma por estos últimos.
              </p>
              <p className="text-gray-700 mb-4">
                En cualquier caso, la obligación de <strong>EL PROVEEDOR, que es de medio y no de resultado</strong>, se limita a suministrar la información solicitada por <strong>LOS OFERENTES</strong> en el mismo estado en que ésta le ha sido suministrada a él por parte de <strong>LOS DEMANDANTES</strong>.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">EXCLUSIONES DEL OBJETO Y DE LAS CORRESPONDIENTES RESPONSABILIDADES DEL PROVEEDOR</h3>
              <p className="text-gray-700 mb-4">
                Son exclusiones del objeto y de las correspondientes responsabilidades que del mismo se podrían derivar para <strong>EL PROVEEDOR</strong>, sin limitarse a ellas, las siguientes:
              </p>

              <h4 className="text-lg font-semibold text-gray-800 mb-3">EXCLUSIÓN EN RAZÓN DE LA NATURALEZA DE LAS PARTES QUE INTERVIENEN EN LA CELEBRACIÓN DE LOS ACTOS.</h4>
              <p className="text-gray-700 mb-4">
                A la luz de lo establecido en los acápites de <strong>"OBJETO"</strong> y <strong>"ALCANCE DEL OBJETO Y OBLIGACIONES DE EL PROVEEDOR"</strong>, los usuarios web, bien sean <strong>DEMANDANTES</strong> u <strong>OFERENTES</strong>, al momento de aceptar el presente Acuerdo y por lo mismo al asumir como regla de uso de la plataforma los presentes Términos de Uso, entienden y aceptan en forma expresa e inequívoca que <strong>EL PROVEEDOR</strong>, en ningún caso actúa asumiendo posición propia de ninguna especie y tampoco ostenta la calidad de corredor o intermediario comercial de ninguna índole frente a los eventuales negocios que lleguen a realizar <strong>LOS DEMANDANTES</strong> y <strong>LOS OFERENTES</strong> entre ellos o con cualquier tercero.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">DECLARACIÓN GENERAL DE EXONERACIÓN DE RESPONSABILIDAD</h3>
              <p className="text-gray-700 mb-4">
                Teniendo en cuenta lo recién expuesto y que cualquier negocio que se realice entre <strong>EL DEMANDANTE</strong> y <strong>EL OFERENTE</strong>, de conformidad con los presentes Términos de Uso, es por completo ajeno a EL PROVEEDOR, éstos, es decir, tanto <strong>EL DEMANDANTE</strong> como <strong>EL OFERENTE</strong>, por virtud de la aceptación de los citados Términos, <strong>EXIMEN EN FORMA ABSOLUTAMENTE CLARA, EXPRESA E INEQUÍVOCA a EL PROVEEDOR, DE CUALQUIER TIPO DE RESPONSABILIDAD DERIVADA DE LOS ACTOS JURÍDICOS MERCANTILES, CIVILES O DE CUALQUIER OTRO TIPO QUE CELEBREN ENTRE ELLOS</strong>.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">RENUNCIA A LA INTERPOSICIÓN DE DEMANDAS Y/O RECLAMACIONES JUDICIALES O EXTRAJUDICIALES</h3>
              <p className="text-gray-700 mb-4">
                Por virtud del perfeccionamiento del presente Acuerdo a través de la aceptación de los Términos de Uso incorporados en este documento virtual y habida cuenta del principio legal de la relatividad de los actos jurídicos, <strong>EL DEMANDANTE</strong> y <strong>EL OFERENTE</strong>, reconociendo que los negocios que acuerden y ejecuten entre ellos son por completo ajenos a la órbita de actuación de <strong>EL PROVEEDOR, DECLARAN, EN FORMA PREVIA, EXPRESA E INEQUÍVOCA, QUE RENUNCIAN EN FORMA IRREVOCABLE A ELEVAR, PRESENTAR O PROMOVER ACCIONES, DEMANDAS O RECLAMACIONES DE CUALQUIER ÍNDOLE, JUDICIALES O EXTRAJUDICIALES, EN CONTRA DE EL PROVEEDOR, CON OCASIÓN O DERIVADAS DE LOS NEGOCIOS QUE CELEBREN O EJECUTEN ENTRE ELLOS.</strong>
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">POLÍTICA DE MANEJO DE DATOS E INFORMACIÓN</h3>
              <p className="text-gray-700 mb-4">
                La aceptación de los Términos de Uso comporta e incluye la aceptación previa y expresa de la política de manejo de datos e información en este documento incluida y muy principalmente de la enunciada, a título ilustrativo, en el presente acápite, por parte de todos los usuarios del portal, registrados o no, quienes desde el mismo momento de entrar a la página por información básica de la misma están entregando su propia información, la cual aceptan que se maneje como pública por parte de <strong>EL PROVEEDOR</strong>.
              </p>

              <h4 className="text-lg font-semibold text-gray-800 mb-3">FACULTAD GENERAL RELATIVA AL USO DE LA INFORMACIÓN POR PARTE DEL PROVEEDOR</h4>
              <p className="text-gray-700 mb-4">
                <strong>Por virtud de la aceptación de los presentes Términos de Uso, el usuario web, bien sea DEMANDANTE u OFERENTE autoriza, previa, expresa e inequívocamente a EL PROVEEDOR LA UTILIZACIÓN COMERCIAL DE LA INFORMACIÓN ENTREGADA AL PORTAL SIN LÍMITE ALGUNO.</strong>
              </p>
              <p className="text-gray-700 mb-4">
                Sin perjuicio de lo anterior, a título meramente ilustrativo y con el fin de clarificar algunos de los usos que <strong>EL PROVEEDOR</strong> le podrá dar a la información obtenida de los usuarios, las partes indican lo siguiente:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li><strong>EL PROVEEDOR</strong> podrá usar, a su arbitrio, los datos de sus usuarios web con una finalidad comercial, operativa y/o estadística, así como para el envío de comunicaciones comerciales sin límite de ninguna índole.</li>
                <li>El usuario web autoriza expresamente el almacenamiento de sus datos sin límite temporal y la posibilidad de hacer estudios de marketing con ellos, para poder adecuar los servicios de <strong>EL PROVEEDOR</strong> a su perfil personal.</li>
                <li>Adicionalmente, <strong>EL PROVEEDOR</strong> podrá ceder todos los datos y la información de los usuarios a terceros con fines comerciales.</li>
                <li><strong>EL PROVEEDOR</strong> podrá conservar los datos de los usuarios web, aunque haya terminado toda relación con los mismos y por el tiempo que estime conveniente para utilizarla comercialmente.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">DERECHO DE CORRECCIÓN Y OPOSICIÓN A LA DIVULGACIÓN</h3>
              <p className="text-gray-700 mb-4">
                Todos los usuarios, sin excepción y en cualquier tiempo, tendrán derecho de acceso, modificación y rectificación de la información por ellos suministrada. Así mismo tendrán la facultad de oponerse a que sus datos de carácter personal, privado y/o confidencial sean divulgados, para lo cual deberán hacer la manifestación de voluntad clara, expresa, inequívoca y por escrito a <strong>EL PROVEEDOR</strong>. De igual forma podrán solicitar la cancelación de su inscripción y registro y la devolución y/o eliminación de su información.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">RESOLUCIÓN DE DIFERENCIAS</h3>
              <p className="text-gray-700 mb-4">
                Cualquier diferencia que se presente entre los usuarios web y <strong>EL PROVEEDOR</strong> en relación con la ejecución de las obligaciones derivadas del presente Acuerdo y los Términos de Uso o referidos a la prestación de los servicios de la plataforma y que LAS PARTES no puedan resolver de común acuerdo, se resolverá conforme a la Ley 1563 de 2012 por la amigable composición.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">FACULTAD DE MODIFICACIÓN UNILATERAL DE LOS TÉRMINOS DE USO</h3>
              <p className="text-gray-700 mb-4">
                Por Acuerdo entre las partes, hecho que corrobora el usuario en forma expresa con la aceptación del presente documento virtual, <strong>EL PROVEEDOR</strong> cuenta con la facultad ilimitada de modificar unilateralmente y en cualquier tiempo, el presente Acuerdo y los correspondientes Términos de Uso en él incluidos. A la luz de lo anterior, <strong>EL PROVEEDOR</strong> les sugiere a los usuarios visitar con regularidad no superior a un (1) mes esta página, con el fin de estar al día en cuanto a las eventuales modificaciones que se puedan producir.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">NORMAS QUE RIGEN LOS TÉRMINOS DE USO</h3>
              <p className="text-gray-700 mb-4">
                El presente Acuerdo y los Términos de uso en el incorporados se rigen y se interpretarán en primera instancia por el contenido de este documento virtual y en lo no establecido en el, por las leyes de la República de Colombia, especialmente por lo dispuesto por Ley Estatutaria 1266 del 31 de diciembre de 2008 o las normas que la complementen, modifiquen, sustituyan o deroguen.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">LLAMADO FINAL</h3>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-800 font-medium">
                  <strong>SI USTED COMO USUARIO WEB NO ACEPTA LOS PRESENTES TÉRMINOS DE USO EN ÉL CONTENIDOS, SE LE SOLICITA EN FORMA RESPETUOSA NO UTILIZAR POR NINGÚN MOTIVO LA PLATAFORMA VIRTUAL DENOMINADA FINDII.CO.</strong>
                </p>
              </div>
              <p className="text-gray-700 mb-4">
                <strong>EL SERVICIO OFRECIDO EN VIRTUD DE ESTOS TÉRMINOS Y CONDICIONES ES DE EXCLUSIVA RESPONSABILIDAD DE FINDII.CO.</strong>
              </p>
              <p className="text-gray-700 mb-4">
                <strong>COMO CONSECUENCIA DE LO ANTERIOR, SE ADVIERTE A LOS USUARIOS QUE CUALQUIER RECLAMO EN RELACIÓN CON LOS SERVICIOS, DEBERÁ SER PRESENTADO DIRECTAMENTE A FINDII.CO. DE ACUERDO CON LO INFORMADO EN LOS PRESENTES TÉRMINOS Y CONDICIONES.</strong>
              </p>
              <p className="text-gray-700">
                De conformidad con lo anterior y una vez leído y aceptado por su propia y libre voluntad la integridad del texto del Acuerdo contentivo de los Términos de Uso de la plataforma virtual de negocios denominada <strong>"FINDII.CO" vigentes a partir de su publicación</strong>, el usuario web procede a su expresa, inequívoca e íntegra <strong>ACEPTACIÓN</strong>, en muestra de lo cual pulsa el link correspondiente a: <strong>ACEPTACIÓN DE LOS TÉRMINOS DE USO</strong> o hace uso en sí de la plataforma en mención, teniendo claro conocimiento de los <strong>TÉRMINOS</strong> aquí descritos.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
