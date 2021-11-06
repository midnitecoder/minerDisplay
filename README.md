# minerDisplay
TaperMonkey script to display hashrates, power consumption and shares per minute

In order to use this script you need to install TaperMonkey (https://www.tampermonkey.net/) so that you an run userscript. I would guess you could find/run other userscripts, but I've only used TaperMonkey thus far.

Presently supported miners:
gminer
lolMiner
nbminer

Credit for the starting point goes to DejanRibnikar for which I found the script at https://greasyfork.org/en/scripts/422711-gminer-hashrate-chart

1. In either the TaperMonkey config (read their docs) or in the top of the script replace the '@match' sections with your hosts and ports that miners are running on.
2. If you want to modify the colors update the block near the top window
3. Presently mapping hashRate by device and pool, powerWattage by device AND shares per minute by device
4. Tried to normalize high hash rate cards a bit, presently only normalizing 3090 and 6800XT cards
