const config = require('./config.json')
const DiscordRPC = require('discord-rpc')
const Websocket = require('ws') // We can use client.gosu for this with setInterval but i think its a cancer
const rpc = new DiscordRPC.Client({ transport: 'ipc' })
const osu = new Websocket(`ws://localhost:${config.gosumemoryPort}/ws`)

rpc.on('ready', () => console.log('Discord Rich Presence is Working'))
rpc.on('error', (e) => console.error(e))
osu.on('error', (e) => {
    console.error(e)
    rpc.clearActivity(process.pid)
})
let lastUpdate;
osu.on('message', (incoming) => {
    if (Date.now() - lastUpdate < config.updateRate) return
    lastUpdate = Date.now()
    let data = JSON.parse(incoming),
        bmstats
    const presence = {
        largeImageKey: 'osu-logo',
        largeImageText: "Playing osu!",
        details: `${data.menu.bm.metadata.artist} - ${data.menu.bm.metadata.title} (by ${data.menu.bm.metadata.mapper})`,
        buttons: []
    }
    switch (data.menu.state) {
        case 0:
            presence.state = 'Just Chilling'
            break
        case 1:
            presence.state = 'Editing a map'
            presence.buttons.push({
                label: `Editing an ${data.menu.pp['100']}pp map`,
                url: `https://github.com/robloxxa/ayantwitchbot`
            })

            break
        case 2:
            let mods = (data.menu.mods.str) ? '+' + data.menu.mods.str : ""
            presence.state = 'Playing a map ' + mods
            bmstats = `AR:${data.menu.bm.stats.AR} CS:${data.menu.bm.stats.CS} OD:${data.menu.bm.stats.OD} HP:${data.menu.bm.stats.HP}`
            presence.smallImageKey = (data.gameplay.hits.grade.current) ? data.gameplay.hits.grade.current.toLowerCase() : 'n'
            presence.smallImageText = 'Rank: ' + data.gameplay.hits.grade.current
            presence.startTimestamp = Date.now() - data.menu.bm.time.current;
            presence.endTimestamp = presence.startTimestamp + data.menu.bm.time.full
            presence.buttons.push({
                label: `${data.gameplay.accuracy}% | ${data.gameplay.pp.current}pp | ${data.gameplay.hits[0]}xMiss`,
                url: `https://github.com/robloxxa/ayantwitchbot`
            })
            break
        case 7:
            presence.state = 'In Result Screen'
            break
        case 4:
        case 5:
        case 15:
            presence.state = 'In Songs Selection'
            break
        case 11:
        case 12:
            presence.state = 'In multiplayer'
            break
        case 19:
            presence.state = 'Updating Beatmaps'
            break
    }
    presence.buttons.push({
        label: (bmstats) ? bmstats : 'Beatmap Link',
        url: `https://osu.ppy.sh/b/${data.menu.bm.id}`
    })
    rpc.setActivity(presence)
})

rpc.login({ clientId: config.clientId })