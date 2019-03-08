module.exports = function teleport(mod) {

    let current_C_PLAYER_LOCATION,
        gameId,
        zone,
        xyz;

    mod.hook('C_PLAYER_LOCATION', 5, (location) => {
        current_C_PLAYER_LOCATION = location;
    });

    mod.hook('S_LOGIN', 10, (event) => {
        gameId = event.gameId;
    });

    mod.hook('S_LOAD_TOPO', 3, (event) => {
        zone = event.zone;
    });

    mod.hook('C_PLAYER_LOCATION', 5, (event) => {
        return !([2, 10].includes(event.type) && (zone < 10 || zone > 200));
    });

    mod.command.add('tp', {
        up(value) {
            if (value) {
                current_C_PLAYER_LOCATION.dest.z += parseInt(value);
                move(current_C_PLAYER_LOCATION.dest);
            }
        },
        down(value) {
            if (value) {
                current_C_PLAYER_LOCATION.dest.z -= parseInt(value);
                move(current_C_PLAYER_LOCATION.dest);
            }
        },
        blink(value) {
            if ((value = parseInt(value))) {
                let x, y, w = current_C_PLAYER_LOCATION.w;

                y = value * Math.sin(w);
                x = Math.sqrt((value * value) - (y * y));

                if (w >= Math.PI / 2 || w <= -Math.PI / 2) {
                    x = -x;
                }

                current_C_PLAYER_LOCATION.dest.x += x;
                current_C_PLAYER_LOCATION.dest.y += y;
                move(current_C_PLAYER_LOCATION.dest);
            }
        }
    });

    function move(dest) {
        mod.send('S_INSTANT_MOVE', 3, {
            gameId: gameId,
            loc: dest,
            w: current_C_PLAYER_LOCATION.w
        });
    }
};
