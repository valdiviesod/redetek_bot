import { createBot, createProvider, createFlow, addKeyword, EVENTS } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'


const PORT = process.env.PORT ?? 3008

const welcomeFlow = addKeyword(EVENTS.WELCOME)
    .addAnswer(`🙌  Hola, te comunicas con el *Chatbot* automático de Redetek, estoy para brindarte la información que necesites.`)
    .addAnswer(['Ten en cuenta que nuestras oficinas operan en *punto físico* de Lunes a Sábado de 08:00 AM a 05:00 PM, al  igual que nuestra *línea telefónica*: 3080010  '])
    .addAnswer(`Escribe *planes* para obtener información sobre los planes de servicio disponibles para ti.`)
    .addAnswer(`Si necesitas soporte técnico, escribe *soporte* para obtener la línea de soporte técnico.`)


const planesFlow = addKeyword(['Planes','planes'])
    .addAnswer(`Donde te encuentras?`)
    .addAnswer(`Escribe *Bogotá* o *Calarcá* para ver las ubicaciones en las que Redetek tiene cobertura.`)

const bogotaFlow = addKeyword(['Bogotá','Bogota', 'bogota', 'bogotá'])
    .addAnswer(`Estas son las localidades en las que tenemos cobertura para *Bogotá*:`)
    .addAnswer([
        'ACAPULCO', 
        'ALCAZARES', 
        'BELLAVISTA', 
        'BONANZA', 
        'BOYACA', 
        'BOSQUE POPULAR', 
        'CLARITA', 
        'CONSOLACION', 
        'DORADO NORTE', 
        'EL PASEO', 
        'ENCANTO', 
        'ESTRADA', 
        'ESTRADITA', 
        'EUROPA', 
        'GAITAN', 
        'ISABELLA', 
        'JUAN XXIII', 
        'LA AURORA', 
        'LA CABAÑA', 
        'LA LIBERTAD', 
        'LA RELIQUIA', 
        'LAS FERIAS', 
        'LAUREL', 
        'LUJAN', 
        'ONCE DE NOVIEMBRE', 
        'PALO BLANCO', 
        'REAL', 
        'SAN FERNANDO', 
        'SANTA HELENITA', 
        'SANTA MARIA DEL LAGO', 
        'SANTA SOFIA', 
        'SIMON BOLIVAR', 
        'SOLEDAD NORTE', 
        'STA ISABEL', 
        'TABORA', 
        'VILLA LUZ', 
        'FRAGUITA', 
        'BALVANERA', 
        'EDUARDO SANTOS', 
        'FRAGUA', 
        'POLICARPA', 
        'PROGRESO-BOYACA', 
        'RESTREPO', 
        'SAN ANTONIO', 
        'SEVILLA', 
        'VERGEL'
      ])
    .addAnswer(`Si estás ubicado en *VOTO NACIONAL* o *SOLEDAD NORTE PARWEY*, o si eres *Persona Jurídica* estos son los planes disponibles para ti:`)
    .addAnswer([`100 MEGAS por $92.000`,
        '300 MEGAS PLUS BANDA ANCHA por $112.000',
        '500 MEGAS PLUS por $159.000'
    ])
    .addAnswer(`Si eres *Persona Natural*, estos son los planes disponibles para ti:`)
    .addAnswer([`TV e Internet Fibra Optica 200 Megas por $65.000  `,
        'TV e Internet 300 Megas por $75.000',
        'TV e Internet 400 Megas por $85.000',
        'TV e Internet 500 Megas por $95.000'
    ])

const calarcaFlow = addKeyword(['Bogotá','Bogota', 'bogota', 'bogotá'])
    .addAnswer(`Hola`)

const soporteFlow = addKeyword(['Soporte','soporte'])
    .addAnswer(`Para soporte técnico debes comunicarte a la siguiente línea telefónica para *Bogotá*: 6013080010 y para *Calarcá*: 6063080012. Allí tu solicitud será validada en un lapso no mayor a 24 horas hábiles laboradas.`)

const main = async () => {
    const adapterFlow = createFlow([welcomeFlow, planesFlow, soporteFlow, planesFlow, bogotaFlow, calarcaFlow])
    
    const adapterProvider = createProvider(Provider)
    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('REGISTER_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('SAMPLES', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    httpServer(+PORT)
}

main()
