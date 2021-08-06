const caxa = require('caxa').default;

(async () => {
    await caxa({
        input: ".",
        output: "executable/gosumemoryrpc.exe",
        command: [
            "{{caxa}}/node_modules/.bin/node",
            "{{caxa}}/index.js",
            "CAXA"
        ],
        exclude: [
            "**/executable/**",
            "**/.**",
        ]
    });
})();