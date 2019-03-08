module.exports = function immersion(mod) {

    // Debug section
    let debug = false;
    mod.command.add('#debug', () => debug = !debug);

    mod.hook('C_START_SKILL', 7, {
        filter: {fake: null}
    }, (event, fake) => {
        if (!debug)
            return;
        console.log(`START(${fake ? "F" : "R"}) : `, event)
    });

    mod.hook('C_CANCEL_SKILL', 3, {
        filter: {fake: null}
    }, (event, fake) => {
        if (!debug)
            return;
        console.log(`CANCEL(${fake ? "F" : "R"}) : `, event)
    });

    // Vars
    let HEALING_IMMERSION = {
        reserved: 0,
        npc: false,
        type: 1,
        huntingZoneId: 0,
        id: 370200
    };

    // C_START_SKILL.7
    let w,
        loc,
        dest,
        unk = true,
        moving = false,
        cont = false,
        target = 0,
        unk2 = false;

    // Ping variables
    let delay = 100;

    // Most recent skill casted
    let id;

    // Immersion reset variables
    let reset = false,
        retries = 2,
        timeouts = [];

    // Commands
    mod.command.add("immersion", {
        retries(value) {
            retries = parseInt(value);
            message(`Retries set to ${value}`)
        }
    });

    mod.hook('C_PLAYER_LOCATION', 5, (event) => {
        w = event.w;
        loc = event.loc;
        dest = event.dest;
    });

    mod.hook('C_START_SKILL', 7, (event) => {
        clearTimeouts();
        if ((id = event.skill.id) !== HEALING_IMMERSION.id)
            return;

        reset = false;

        setTimeout(() => {
            for (let i = 0; i < retries && !reset; i++) {
                timeouts.push(setTimeout(cancelImmersion, delay * i));
                timeouts.push(setTimeout(sendImmersion, delay * i));
            }
        }, delay);
    });

    mod.hook('S_CREST_MESSAGE', 2, (event) => {
        if (event.type === 6 && id === HEALING_IMMERSION.id) {
            reset = true;
            clearTimeouts();
        }
    });

    // Functions
    function clearTimeouts() {
        for (let i = 0; i < timeouts.length; i++) {
            clearTimeout(timeouts[i]);
        }
        timeouts = [];
    }

    function message(msg) {
        mod.send('S_DUNGEON_EVENT_MESSAGE', 2, {
            type: 70,
            chat: false,
            channel: 0,
            message: msg
        });
    }

    function sendImmersion() {
        mod.send('C_START_SKILL', 7, {
                skill: HEALING_IMMERSION,
                w,
                loc,
                dest,
                unk,
                moving,
                cont,
                target,
                unk2
            }
        );
    }

    function cancelImmersion() {
        mod.send('C_CANCEL_SKILL', 3, {
                skill: {
                    reserved: 0,
                    npc: false,
                    type: 1,
                    huntingZoneId: 0,
                    id: HEALING_IMMERSION.id + 10,
                },
                type: 1
            }
        );
    }
};
