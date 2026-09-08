export async function analyzeVideo(url, amount = 5) {

    console.log("Analizando:", url);
    console.log("Cantidad solicitada:", amount);

    await new Promise(resolve => {
        setTimeout(resolve, 1500);
    });

    const fakeClips = [
        {
            start: "02:14",
            end: "02:52",
            score: 96,
            reason: "Momento interesante con una conclusión clara."
        },
        {
            start: "07:31",
            end: "08:16",
            score: 91,
            reason: "Cambio importante de tema."
        },
        {
            start: "14:03",
            end: "14:47",
            score: 87,
            reason: "Frase destacable y buen cierre."
        },
        {
            start: "18:21",
            end: "19:05",
            score: 84,
            reason: "Momento con bastante interés."
        },
        {
            start: "23:47",
            end: "24:31",
            score: 81,
            reason: "Buena conclusión."
        }
    ];

    return fakeClips.slice(0, amount);
}