import { createBot, createProvider, createFlow, addKeyword, EVENTS } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { RateLimiter } = require('limiter');

const PORT = process.env.PORT ?? 3000

let selectedCity = '';

const welcomeFlow = addKeyword(EVENTS.WELCOME)
    .addAnswer(`🙌  Hola, te comunicas con el *Chatbot* automático de Redetek, estoy para brindarte la información que necesites.`)
    .addAnswer(`Escribe *planes* para obtener información sobre los planes de servicio disponibles para ti.`)
    .addAnswer(`Si necesitas realizar una *Reconexión del servicio* o soporte técnico en general, escribe *soporte* para obtener la línea de soporte técnico.`)
    .addAnswer(`Si necesitas la dirección de nuestras oficinas, escribe *oficinas*.`)
    .addAnswer(['Si deseas realizar el *pago* de tus servicios, comunícate vía Whatsapp a la línea:  3176580234'])
    .addAnswer(['Ten en cuenta que nuestras oficinas operan en *punto físico* de Lunes a Sábado de 08:00 AM a 05:00 PM en *Bogotá*, al  igual que nuestra *línea telefónica*: 3080010, indicativo 601 '])
    .addAnswer(['En *Calarcá* nuestras oficinas operan en *punto físico* de Lunes a Sábado de 07:30 AM a Medio día y de Medio día a 06:00 PM, al  igual que nuestra *línea telefónica*: 3080012, indicativo 606  '])
    .addAnswer(['Si deseas cancelar tu servicio, escribe *retiro* para ver las condiciones y el proceso del retiro de nuestro planes '])

const planesFlow = addKeyword(['Planes', 'planes'])
    .addAnswer(`¿Dónde te encuentras?`)
    .addAnswer(`Escribe *Bogotá* o *Calarcá* para ver las ubicaciones en las que Redetek tiene cobertura.`)

const bogotaFlow = addKeyword(['Bogotá', 'Bogota', 'bogota', 'bogotá'])
    .addAnswer(`Estos son los barrios en los que tenemos cobertura para *Bogotá*:`, null, (ctx) => {
        selectedCity = 'Bogotá';
    })
    .addAnswer([
        'ACAPULCO', 'ALCAZARES', 'BELLAVISTA', 'BONANZA', 'BOYACA',
        'BOSQUE POPULAR', 'CLARITA', 'CONSOLACION', 'DORADO NORTE',
        'EL PASEO', 'ENCANTO', 'ESTRADA', 'ESTRADITA', 'EUROPA',
        'GAITAN', 'ISABELLA', 'JUAN XXIII', 'LA AURORA', 'LA CABAÑA',
        'LA LIBERTAD', 'LA RELIQUIA', 'LAS FERIAS', 'LAUREL', 'LUJAN',
        'ONCE DE NOVIEMBRE', 'PALO BLANCO', 'REAL', 'SAN FERNANDO',
        'SANTA HELENITA', 'SANTA MARIA DEL LAGO', 'SANTA SOFIA',
        'SIMON BOLIVAR', 'SOLEDAD NORTE', 'STA ISABEL', 'TABORA',
        'VILLA LUZ', 'FRAGUITA', 'BALVANERA', 'EDUARDO SANTOS',
        'FRAGUA', 'POLICARPA', 'PROGRESO-BOYACA', 'RESTREPO',
        'SAN ANTONIO', 'SEVILLA', 'VERGEL', 'VOTO NACIONAL', 'SOLEDAD NORTE PARWEY'
    ])
    .addAnswer(`Por favor, escribe el nombre de tu barrio.`)

const calarcaFlow = addKeyword(['Calarca', 'calarca', 'Calarcá', 'calarcá'])
    .addAnswer(`Estos son los barrios en los que tenemos cobertura para *Calarcá*:`, null, (ctx) => {
        selectedCity = 'Calarcá';
    })
    .addAnswer([
        'ANTONIA SANTOS', 'ANTONIO NARIÑO', 'AV. COLON', 'BALCONES DE LA VILLA',
        'BALCONES VIEJO', 'BOSQUES DE LA BELLA', 'BUENA VISTA', 'CAFETEROS',
        'CALDAS', 'CENTRO', 'CRISTO REY', 'DIVINO NIÑO', 'ECOMAR', 'EL BOSQUE',
        'GAITAN', 'GUADUALES', 'HUERTA', 'JARDIN', 'LA BELLA', 'LA FLORESTA',
        'LA GRAN VIA', 'LA ISLA', 'LA PISTA', 'LA PLAYITA', 'LAS AGUAS',
        'LAS PALMAS', 'MANANTIAL', 'MIRADOR DE GUADUALES', 'MONTECARLO',
        'NARANJAL', 'OSCAR TOBON', 'PINAR', 'PLAZUELAS DE LA VILLA',
        'PORTAL DE BALCONES', 'PORVENIR', 'PRADERA ALTA', 'PRIMAVERA',
        'RECUERDO', 'SANTA LUISA DE', 'FINCA LA ESPERANZA', 'ASOMECA',
        'CAMELIAS 2', 'FERIAS', 'LAURELES', 'LUIS CARLOS GALAN',
        'MARIANO OSPINA', 'MILCIADES SEGURA', 'POPULAR', 'SAN BERNANDO',
        'SIMÓN BOLIVAR', 'TERRAQUIMBAYA', 'TERRAZAS DE BUENA VISTA',
        'VALDEPENA', 'VARSOVIA', 'VERACRUZ', 'VILLA ASTRID CAROLINA',
        'VILLA GRANDE', 'VILLA ITALIA', 'VILLA JAZMIN', 'VILLA TATIANA',
        'VILLAS DEL CAFE', 'VIRGINIA', 'PRADERA BAJA'
    ])
    .addAnswer(`Por favor, escribe el nombre de tu barrio.`)

const barriosEspecialesBogotaFlow = addKeyword(['voto nacional', 'soledad norte parwey'])
    .addAnswer(`Estos son los planes disponibles para ti:`)
    .addAnswer([
        `100 MEGAS por $92.000`,
        '300 MEGAS PLUS BANDA ANCHA por $112.000',
        '500 MEGAS PLUS por $159.000'
    ])
    .addAnswer(`Si estás interesado en alguno de los planes, escribe *contratar*`)
    .addAnswer(`Si deseas ver las condiciones del servicio, escribe *condiciones*`)

const barriosEspecialesCalarca = addKeyword(['virginia', 'mariano ospina', 'cafeteros', 'divino niño', 'ferias', 'antonio nariño', 'pradera baja', 'cristo rey'])
    .addAnswer(`Estos son los planes disponibles para ti:`)
    .addAnswer([
        `50 MEGAS por $40.000`,
        '100 MEGAS por $50.000',
        '150 MEGAS por $60.000'
    ])
    .addAnswer(`Si estás interesado en alguno de los planes, escribe *contratar*`)
    .addAnswer(`Si deseas ver las condiciones del servicio, escribe *condiciones*`)

const barriosBogota = addKeyword(['ACAPULCO', 'ALCAZARES', 'BELLAVISTA', 'BONANZA', 'BOYACA',
        'BOSQUE POPULAR', 'CLARITA', 'CONSOLACION', 'DORADO NORTE',
        'EL PASEO', 'ENCANTO', 'ESTRADA', 'ESTRADITA', 'EUROPA',
        'GAITAN', 'ISABELLA', 'JUAN XXIII', 'LA AURORA', 'LA CABAÑA',
        'LA LIBERTAD', 'LA RELIQUIA', 'LAS FERIAS', 'LAUREL', 'LUJAN',
        'ONCE DE NOVIEMBRE', 'PALO BLANCO', 'REAL', 'SAN FERNANDO',
        'SANTA HELENITA', 'SANTA MARIA DEL LAGO', 'SANTA SOFIA',
        'SIMON BOLIVAR', 'SOLEDAD NORTE', 'STA ISABEL', 'TABORA',
        'VILLA LUZ', 'FRAGUITA', 'BALVANERA', 'EDUARDO SANTOS',
        'FRAGUA', 'POLICARPA', 'PROGRESO-BOYACA', 'RESTREPO',
        'SAN ANTONIO', 'SEVILLA', 'VERGEL'])
    .addAnswer(`Si eres persona natural, escribe *natural* y si eres persona juridica escribe *juridica*`)

const barriosCalarca = addKeyword(['ANTONIA SANTOS', 'AV. COLON', 'BALCONES DE LA VILLA',
        'BALCONES VIEJO', 'BOSQUES DE LA BELLA', 'BUENA VISTA', 
        'CALDAS', 'CENTRO', 'ECOMAR', 'EL BOSQUE', 'GAITAN', 'GUADUALES', 'HUERTA', 'JARDIN', 'LA BELLA', 'LA FLORESTA',
        'LA GRAN VIA', 'LA ISLA', 'LA PISTA', 'LA PLAYITA', 'LAS AGUAS',
        'LAS PALMAS', 'MANANTIAL', 'MIRADOR DE GUADUALES', 'MONTECARLO',
        'NARANJAL', 'OSCAR TOBON', 'PINAR', 'PLAZUELAS DE LA VILLA',
        'PORTAL DE BALCONES', 'PORVENIR', 'PRADERA ALTA', 'PRIMAVERA',
        'RECUERDO', 'SANTA LUISA DE', 'FINCA LA ESPERANZA', 'ASOMECA',
        'CAMELIAS 2', 'LAURELES', 'LUIS CARLOS GALAN', 'MILCIADES SEGURA', 'POPULAR', 'SAN BERNANDO',
        'SIMÓN BOLIVAR', 'TERRAQUIMBAYA', 'TERRAZAS DE BUENA VISTA',
        'VALDEPENA', 'VARSOVIA', 'VERACRUZ', 'VILLA ASTRID CAROLINA',
        'VILLA GRANDE', 'VILLA ITALIA', 'VILLA JAZMIN', 'VILLA TATIANA',
        'VILLAS DEL CAFE'])
    .addAnswer(`Estos son los planes disponibles para ti:`)
    .addAnswer([
        `10 MEGAS por $40.000`,
        '15 MEGAS por $50.000',
        '30 MEGAS por $60.000'
    ])
    .addAnswer(`Si estás interesado en alguno de los planes, escribe *contratar*`)
    .addAnswer(`Si deseas ver las condiciones del servicio, escribe *condiciones*`)


const personaNaturalBogotaFlow = addKeyword(['natural', 'Natural'])
    .addAnswer(`Si eres *Persona Natural* en Bogotá, estos son los planes disponibles para ti:`)
    .addAnswer([
        `TV e Internet Fibra Optica 200 Megas por $65.000`,
        'TV e Internet 300 Megas por $75.000',
        'TV e Internet 400 Megas por $85.000',
        'TV e Internet 500 Megas por $95.000'
    ])
    .addAnswer(`Si estás interesado en alguno de los planes, escribe *contratar*`)
    .addAnswer(`Si deseas ver las condiciones del servicio, escribe *condiciones*`)

const personaJuridicaBogotaFlow = addKeyword(['jurídica', 'juridica', 'Jurídica', 'Juridica'])
    .addAnswer(`Si eres *Persona Jurídica* en Bogotá estos son los planes disponibles para ti:`)
    .addAnswer([
        `100 MEGAS por $92.000`,
        '300 MEGAS PLUS BANDA ANCHA por $112.000',
        '500 MEGAS PLUS por $159.000'
    ])
    .addAnswer(`Si estás interesado en alguno de los planes, escribe *contratar*`)
    .addAnswer(`Si deseas ver las condiciones del servicio, escribe *condiciones*`)

const oficinasFlow = addKeyword(['Oficinas', 'oficinas'])
    .addAnswer(`Estas son nuestras oficinas en *Bogotá*:`)
    .addAnswer(`San fernando Cra 58# 73-12 `)
    .addAnswer(`La Estrada Cll 66 #69p 39 `)
    .addAnswer(`Boyacá Real Cll 69a # 74a 21 `)
    .addAnswer(`Fraguita  Cra 24 #7 - 49sur`)
    .addAnswer(`Y esta es nuestra oficina en *Calarcá*:`)
    .addAnswer(`Av colon # 26-33`)

const contratarFlow = addKeyword(['contratar', 'Contratar'])
    .addAnswer(`Debes acercarte a la oficina más cercana con una copia de tu cedula y una de un recibo público donde se evidencie la dirección exacta a instalar para la validación del costo de instalación, el cual puede costar entre $0 a $90.000 pesos`)
    .addAnswer(`Si deseas ver la dirección de la oficina más cercana a ti, escribe *oficinas*`)
    .addAnswer(`Si deseas ver las condiciones del servicio, escribe *condiciones*`)

const condicionesFlow = addKeyword(['Condiciones', 'condiciones'])
    .addAnswer([`Todos los planes cuentan con clausula de permanencia de 1 (un) año.`,
        'Se firma contrato a comodato frente al modem, el cual deben reintegran al finalizar el contrato. ',
        'La TV en señal analoga (TVs basicos que no cuentan con la TDT) sintoniza actualmente 54 canales y en señal digital (TVs que cuentan con la TDT incorporada) más de 130 canales.',
        'El servicio de solo TV tiene un costo de 38.000 y contiene los mismos canales con cableado completamente nuevo, si en la vivienda existe una cometida ya montada en estado útil se brinda la señal por ese mismo medio de hasta 4 TVs por el mismo costo; Si este cableado no es útil debe cancelar derivaciones por punto con un costo de 20.000, son permitidos máximo 4 TVs por esa tarifa, si supera esa cantidad se evalua una tarifa especial según los TVs que maneje en la vivienda.',
        'El servicio de instalación se establece entre 1 a 6 días hábiles como máximo.'
    ])

const soporteFlow = addKeyword(['Soporte', 'soporte'])
    .addAnswer(`Para soporte técnico debes comunicarte a la siguiente línea telefónica para *Bogotá*: 6013080010 y para *Calarcá*: 6063080012. Allí tu solicitud será validada en un lapso no mayor a 24 horas hábiles laboradas.`)

const retiroFlow = addKeyword(['Retiro', 'retiro'])
    .addAnswer(`Para realizar un retiro debe estar al día en pagos (clausula,equipos,mensualidades). Debe entregar el micronodo junto al cargador o el modem junto al cargador *segun los equipos que maneje en la vividenda*. Además debe presentar una carta de retiro junto a la  copia de la cedula del titular. Si la persona que se presenta es un tercero, debe tener también una carta autorizando el retiro al tercero junto a la copia de la cedula del titular y la de quien presenta la solicitud; Todo esto antes del día 1 del mes que no desea que le facturen.`)

const main = async () => {
    const adapterFlow = createFlow([welcomeFlow, planesFlow, soporteFlow, condicionesFlow, contratarFlow, oficinasFlow, personaJuridicaBogotaFlow, personaNaturalBogotaFlow, barriosBogota, barriosCalarca, barriosEspecialesBogotaFlow, barriosEspecialesCalarca, calarcaFlow, bogotaFlow, retiroFlow])

    const adapterProvider = createProvider(Provider, {
        experimentalStore: true,
        timeRelease: 300000, // 5 minutes in milliseconds
        markReadMessage: true,
        retryStrategy: {
            attempts: 3,
            delay: 5000
        }
    })
    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    // Create a rate limiter that allows 5 requests per second
    const limiter = new RateLimiter({ tokensPerInterval: 5, interval: "second" });

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            try {
                await limiter.removeTokens(1);
                const { number, message, urlMedia } = req.body
                await bot.sendMessage(number, message, { media: urlMedia ?? null })
                    .catch(err => {
                        console.error(`Error sending message to ${number}:`, err);
                        throw err; // Re-throw to be caught by the outer catch
                    });
                res.status(200).send('Message sent successfully')
            } catch (err) {
                console.error(`Failed to process message for ${req.body.number}:`, err);
                res.status(500).send('Message processing failed');
            }
        })
    )

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            try {
                await limiter.removeTokens(1);
                const { number, name } = req.body
                await bot.dispatch('REGISTER_FLOW', { from: number, name })
                res.status(200).send('Register flow triggered successfully')
            } catch (err) {
                console.error(`Failed to trigger register flow for ${number}:`, err);
                res.status(500).send('Flow trigger failed');
            }
        })
    )

    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            try {
                await limiter.removeTokens(1);
                const { number, name } = req.body
                await bot.dispatch('SAMPLES', { from: number, name })
                res.status(200).send('Samples flow triggered successfully')
            } catch (err) {
                console.error(`Failed to trigger samples flow for ${number}:`, err);
                res.status(500).send('Flow trigger failed');
            }
        })
    )

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            try {
                await limiter.removeTokens(1);
                const { number, intent } = req.body
                if (intent === 'remove') bot.blacklist.remove(number)
                if (intent === 'add') bot.blacklist.add(number)
                res.status(200).json({ status: 'ok', number, intent })
            } catch (err) {
                console.error(`Failed to modify blacklist for ${number}:`, err);
                res.status(500).send('Blacklist modification failed');
            }
        })
    )
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        // Aplicación específica: Decidir si terminar el proceso
        // process.exit(1);
    });

    httpServer(+PORT)
}

main().catch(err => {
    console.error('Failed to start the bot:', err);
    process.exit(1);
});
