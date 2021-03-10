importScripts("https://d3js.org/d3-format.v2.min.js");
importScripts("https://d3js.org/d3-array.v2.min.js");
importScripts("https://d3js.org/d3-color.v2.min.js");
importScripts("https://d3js.org/d3-ease.v2.min.js");
importScripts("https://d3js.org/d3-interpolate.v2.min.js");

let config = {
    initShowTime: 500,
    animationDuration: 5000,
    // bar区域的左、右、上、下间距（没有计入周围的文本） 
    m: [0.2, 0.3, 0.1, 0.1],
    // 时间文本的位置
    timeTextRight: 0.25,
    timeTextTop: 0.85,
    barGapRatio: 2,
    //barStroke: 'none',
    objNum: 10,
    labelPrecision: { 'en': 3, 'zh': 4 },
    tickNum: 5,
    swapTime: 500,
    frameMs: 20,
    valueSwapRatio: 0.5,

    barFill: "#eee",
    barStroke: "#bbb",
    barStrokeWidth: "0.25vmin",

    textFill: "#eee",
    textStroke: "#fff",
    textStrokeWidth: "0.1vmin",

    // 是否显示条形内的名字
    showBarInnerLabel: false,

    // 字体大小和bar高度的比例
    barOuterLabelSize: 0.8,
    barOuterNumberSize: 0.8,
    barInnerLabelSize: 0.8,
    axisNumberSize: 0.8,
    timeTextSize: 1,


    // axis颜色
    axisLineFill: "#bbb",
    // axis文字颜色
    axisTextFill: "#bbb",

    // bar圆角
    barRoundCorner: 0,

    barClasses: [
        "dynamic-num-lable",
        "dynamic-num-line",
        "dynamic-bar",
        "dynamic-bar-text",
        "dynamic-bar-textB",
        "dynamic-time-text",
        'dynamic-bar-num-lable'
    ],
    numLableClass: "dynamic-num-lable",
    numLineClass: "dynamic-num-line",
    barNumLableClass: 'dynamic-bar-num-lable',
    barClass: "dynamic-bar",
    barTextClass: "dynamic-bar-text",
    barTextClassB: "dynamic-bar-textB",
    timeLabelClass: "dynamic-time-text",

    svgId: "dynamic-container",
    stateBackground: "#4B9DEA",
    interpolationStep: 100,
    interpolationStepOld: 4,
    svg: undefined,
    width: undefined,
    height: undefined,
    valueRange: [1, 10],
    growRange: [0.5, 2],
    //growRange: [0.8, 1.25],
    showResults: true,
};


let helper = {
    getRadioChecked: function (name) {
        let radio = document.getElementsByName(name);
        for (let i = 0; i < radio.length; i++) {
            if (radio[i].checked) {
                return radio[i].value;
            }
        }
    },
    rgb_to_hex: function (color) {
        let r = parseInt(color[0]).toString(16);
        if (r.length < 2) r = "0" + r;
        let g = parseInt(color[1]).toString(16);
        if (g.length < 2) g = "0" + g;
        let b = parseInt(color[2]).toString(16);
        if (b.length < 2) b = "0" + b;
        return "#" + r + g + b;
    },
    get_digits: function (num) {
        let ct = 0;
        while (num < 1) {
            num = num * 10;
            ct = ct - 1;
        }
        while (num >= 10) {
            num = num / 10;
            ct = ct + 1;
        }
        return [Math.floor(num), Math.pow(10, ct)];
    },
    formatter: function (num, language, precision, axis = false) {
        if (language === "en") return helper.formatterEN(num, axis, precision);
        else return helper.formatterCN(num, axis, precision);
    },
    formatterEN: function (num, axis, labelPrecision) {
        if (axis) return d3.format("." + labelPrecision + "s")(num);
        else return d3.format("." + labelPrecision + "s")(num);
    },
    formatterCN: function (num, axis, CNlabelPrecision) {
        let ifaddR = axis ? '' : 'r'
        if (Math.abs(num) < 10000) return d3.format("." + CNlabelPrecision + ifaddR)(num);
        else if (Math.abs(num) < 10000 * 10000)
            return d3.format("." + CNlabelPrecision + ifaddR)(num / 10000) + "万";
        else if (Math.abs(num) < 10000 * 10000 * 10000)
            return d3.format("." + CNlabelPrecision + ifaddR)(num / (10000 * 10000)) + "亿";
        else return d3.format("." + CNlabelPrecision + ifaddR)(num / (10000 * 10000 * 10000)) + "万亿";
    },
    dateformatDash: function (d) {
        var year = d.getFullYear();
        var month = d.getMonth() + 1;
        if (month < 10) month = "0" + month
        var date = d.getDate();
        if (date < 10) date = "0" + date
        return ([year, month, date].join('-'));
    },
    obj2Array: function (obj) {
        let arr = [];
        for (let i of Object.keys(obj)) {
            arr.push(obj[i]);
        }
        return arr;
    },
    toTransform: function (x, y) {
        return 'translate(' + x + ',' + y + ')'
    },
    maxRegression: function (minArr, maxArr) {
        let newMaxArr = [];
        newMaxArr = maxArr;
        return [minArr, newMaxArr]
    },
    newElement: function (type, xd, yd) {
        if (type === 'rect') {
            return {
                value: { d: [], t: xd },
                attr: {
                    width: { d: [], t: xd },
                    y: { d: [], t: yd },
                },
                style: {
                    "fill-opacity": { d: [], t: yd }
                }
            };
        } else if (type === 'static-text') {
            return {
                attr: {
                    transformOri: { dx: [], tx: xd, dy: [], ty: yd }
                },
                style: {
                    "fill-opacity": { d: [], t: yd },
                    "stroke-opacity": { d: [], t: yd },
                }
            };
        } else if (type === 'static-text2') {
            return {
                attr: {
                    transformOri: { dx: [], tx: xd, dy: [], ty: yd }
                },
                style: {
                    "opacityOri": { dx: [], tx: xd, dy: [], ty: yd },
                }
            };
        } else if (type === 'dynamic-text') {
            return {
                text: { d: [], t: xd },
                attr: {
                    transformOri: { dx: [], tx: xd, dy: [], ty: yd }
                },
                style: {
                    "font-size": { d: [], t: xd },
                    "fill-opacity": { d: [], t: yd },
                    "stroke-opacity": { d: [], t: yd },
                }
            };
        } else return {}
    },
    dataGroupById: function (data, min, max, time, xDuration) {
        let dataById = {}
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                if (typeof dataById[data[i][j]['id']] === 'undefined') {
                    dataById[data[i][j]['id']] = {
                        id: data[i][j]['id'],
                        name: data[i][j]['name'],
                        x: [],
                        y: [],
                    }
                }
                dataById[data[i][j]['id']]['x'].push({
                    value: data[i][j]['value'],
                    min: data[i][j]['min'],
                    max: data[i][j]['max'],
                    time: data[i][j]['time'],
                    duration: data[i][j]['duration-x']
                })
                dataById[data[i][j]['id']]['y'].push({
                    rank: j,
                    time: data[i][j]['time'],
                    duration: data[i][j]['duration-y']
                })
            }
        }
        return {
            data: dataById,
            min,
            max,
            time,
            xDuration
        }
    },
    drawAniLine: function (i, g, xr, fill) {
        let lastj = 0
        let j
        let fo
        for (j = 1; j < i.attributes.attr.y.length; j++) {
            if (Math.abs(i.attributes.attr.y[j] - i.attributes.attr.y[j - 1]) > 0.001) {
                fo = Math.min(+i.attributes.style['fill-opacity'][lastj], (j - lastj > 1) ? 0.2 : 0.7)
                g.append('rect')
                    .attr('x', lastj / xr)
                    .attr('y', i.attributes.attr.y[lastj])
                    .attr('height', i.static.attr.height)
                    .attr('width', (j - lastj) / xr)
                    .style('fill', fill)
                    .style('fill-opacity', fo)
                lastj = j
            }
        }
        fo = Math.min(+i.attributes.style['fill-opacity'][lastj], (j - lastj > 1) ? 0.2 : 0.7)
        g.append('rect')
            .attr('x', lastj / xr)
            .attr('y', i.attributes.attr.y[lastj])
            .attr('height', i.static.attr.height)
            .attr('width', (1 + j - lastj) / xr)
            .style('fill', fill)
            .style('fill-opacity', fo)

    }

};

function tableToJSON(tbData, nameRC) {
    //console.log(tbData, nameRC)
    let timeRange;
    let convertData = [];
    if (nameRC === "row") {
        for (let i = 1; i < tbData.length; i++) {
            if (isNaN(Date.parse(tbData[i][0]))) {
                return { success: false, error_type: "date" };
            }
        }
        timeRange = [
            new Date(tbData[1][0]).getTime(),
            new Date(tbData[tbData.length - 1][0]).getTime(),
        ];
        for (let i = 1; i < tbData.length; i++) {
            let temp = [];
            for (let j = 1; j < tbData[i].length; j++) {
                if (isNaN(Number(tbData[i][j]))) {
                    return { success: false, error_type: "data" };
                }
                temp.push({
                    name: tbData[0][j],
                    value: +tbData[i][j],
                    time: new Date(tbData[i][0]).getTime(),
                    id: j - 1,
                });
            }
            convertData.push(temp);
        }
    } else {
        for (let i = 1; i < tbData[0].length; i++) {
            if (isNaN(Date.parse(tbData[0][i]))) {
                return { success: false, error_type: "date" };
            }
        }
        timeRange = [
            new Date(tbData[0][1]).getTime(),
            new Date(tbData[0][tbData[0].length - 1]).getTime(),
        ];
        for (let i = 1; i < tbData[0].length; i++) {
            let temp = [];
            for (let j = 1; j < tbData.length; j++) {
                if (isNaN(Number(tbData[j][i]))) {
                    return { success: false, error_type: "data" };
                }
                temp.push({
                    name: tbData[j][0],
                    value: +tbData[j][i],
                    time: new Date(tbData[0][i]).getTime(),
                    id: j - 1,
                });
            }
            convertData.push(temp);
        }
    }
    //console.log(convertData)
    return { success: true, data: convertData, timeRange };
}

let dataGenerator = {
    tableToJSON(tbData, nameRC) {
        let timeRange;
        let convertData = [];
        if (nameRC === "row") {
            for (let i = 1; i < tbData.length; i++) {
                if (isNaN(Date.parse(tbData[i][0]))) {
                    return { success: false, error_type: "date" };
                }
            }
            timeRange = [
                new Date(tbData[1][0]).getTime(),
                new Date(tbData[tbData.length - 1][0]).getTime(),
            ];
            for (let i = 1; i < tbData.length; i++) {
                let temp = [];
                for (let j = 1; j < tbData[i].length; j++) {
                    if (isNaN(tbData[i][j])) {
                        return { success: false, error_type: "data" };
                    }
                    temp.push({
                        name: tbData[0][j],
                        value: +tbData[i][j],
                        time: new Date(tbData[i][0]).getTime(),
                        id: j - 1,
                    });
                }
                convertData.push(temp);
            }
        } else {
            for (let i = 1; i < tbData[0].length; i++) {
                if (isNaN(Date.parse(tbData[0][i]))) {
                    return { success: false, error_type: "date" };
                }
            }
            timeRange = [
                new Date(tbData[0][1]).getTime(),
                new Date(tbData[0][tbData[0].length - 1]).getTime(),
            ];
            for (let i = 1; i < tbData[0].length; i++) {
                let temp = [];
                for (let j = 1; j < tbData.length; j++) {
                    if (isNaN(tbData[j][i])) {
                        return { success: false, error_type: "data" };
                    }
                    temp.push({
                        name: tbData[j][0],
                        value: +tbData[j][i],
                        time: new Date(tbData[0][i]).getTime(),
                        id: j - 1,
                    });
                }
                convertData.push(temp);
            }
        }
        return { success: true, data: convertData, timeRange };
    },
    linearInterpolation: function (data, steps) {
        let newData = [];
        for (let i = 0; i < data.length - 1; i++) {
            newData.push(data[i]);
            for (let j = 0; j < steps; j++) {
                let tempData = [];
                for (let k = 0; k < data[i].length; k++) {
                    tempData[k] = {
                        name: data[i][k].name,
                        value:
                            ((data[i + 1][k].value - data[i][k].value) * (j + 1)) /
                            (steps + 1) +
                            data[i][k].value,
                        time:
                            ((data[i + 1][k].time - data[i][k].time) * (j + 1)) /
                            (steps + 1) +
                            data[i][k].time,
                        max:
                            ((data[i + 1][k].max - data[i][k].max) * (j + 1)) /
                            (steps + 1) +
                            data[i][k].max,
                        min:
                            ((data[i + 1][k].min - data[i][k].min) * (j + 1)) /
                            (steps + 1) +
                            data[i][k].min,
                        id: data[i][k].id,
                    };
                }
                newData.push(tempData);
            }
        }
        newData.push(data[data.length - 1]);
        return newData;
    },
    stageCsvForDebug: function (filterData) {
        let csvData = {};
        for (let i = 0; i < filterData[0].length; i++) {
            csvData[filterData[0][i]["name"]] = [];
        }
        for (let i = 0; i < filterData.length; i++) {
            for (let j = 0; j < filterData[i].length; j++) {
                csvData[filterData[i][j]["name"]].push(10 - j);
            }
        }
        console.log(csvData);
    },
    sortData: function (data) {
        let newData = [];
        for (let i = 0; i < data.length; i++) {
            newData[i] = this.copyData(data[i]);
        }
        for (let i = 0; i < newData.length; i++) {
            newData[i].sort((a, b) => {
                return b["value"] - a["value"];
            });
        }
        return newData;
    },
    sortDataOldStage: function (data, animationDuration) {
        data = this.sortData(data)
        let duration = []
        for (let i = 0; i < data.length - 1; i++) {
            duration.push(animationDuration);
        }
        duration.push(0)
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                data[i][j]['duration-x'] = duration[i]
                data[i][j]['duration-y'] = duration[i]
            }
        }

        let time = []
        let mins = []
        let maxs = []
        for (let i = 0; i < data.length; i++) {
            time.push(data[i][0]['time'])
            mins.push(data[i][0]['min'])
            maxs.push(data[i][0]['max'])
        }

        return helper.dataGroupById(data, mins, maxs, time, duration);
    },
    sortDataItemWise: function (data, animationDuration, frameMs, swapTime) {
        let newData = dataGenerator.linearInterpolation(
            data,
            Math.ceil(animationDuration / frameMs) - 1
        );
        data.push(data[data.length - 1])
        let stageData = this.sortDataOldStage(data, animationDuration)
        //console.log(stageData)
        //let mergeThs = 0
        let mergeThs = Math.ceil(swapTime / frameMs)
        for (let i = 0; i < newData.length; i++) {
            newData[i].sort((a, b) => {
                return b["value"] - a["value"];
            });
        }
        let itemRanks = {}
        for (let i = 0; i < newData.length; i++) {
            for (let j = 0; j < newData[i].length; j++) {
                if (typeof itemRanks[newData[i][j].id] === 'undefined') {
                    itemRanks[newData[i][j].id] = []
                }
                itemRanks[newData[i][j].id].push({
                    rank: j,
                    ...newData[i][j]
                })
            }
        }
        //console.log(newData)
        //console.log(itemRanks)
        console.log("mergeThs", mergeThs)
        let fItemRanks = {}
        let overflowTime = 0

        for (let i in itemRanks) {
            fItemRanks[i] = [{
                tid: 0,
                rank: itemRanks[i][0]['rank'],
                time: itemRanks[i][0]['time']
            }]
            for (let j = 1; j < itemRanks[i].length; j++) {
                if (itemRanks[i][j]['rank'] !== itemRanks[i][j - 1]['rank']) {
                    fItemRanks[i].push({
                        tid: j,
                        rank: itemRanks[i][j]['rank'],
                        time: itemRanks[i][j]['time']
                    })
                }
            }
        }

        // 先合并方向相同的时间相邻的排名变化，再合并其它时间相邻的排名变化，合并后不再累加mergeThs
        /*
        let rankChanges = {}
        for (let i in fItemRanks) {
            let newRanks = []
            for (let j = 1; j < fItemRanks[i].length; j++) {
                let pre = fItemRanks[i][j]['tid'] - 1
                //let preRank = itemRanks[i][pre]['rank']
                let post = fItemRanks[i][j]['tid']
                let rise = fItemRanks[i][j]['rank'] - fItemRanks[i][j - 1]['rank']

                while (j + 1 < fItemRanks[i].length
                    && fItemRanks[i][j + 1]['tid'] - fItemRanks[i][j]['tid'] <= mergeThs
                    && rise * (fItemRanks[i][j + 1]['rank'] - fItemRanks[i][j]['rank']) > 0
                ) {
                    //pre = fItemRanks[i][j + 1]['tid'] - 1
                    post = fItemRanks[i][j + 1]['tid']
                    j = j + 1
                    //console.log(i, j, post)
                }
                //if (post - pre > 2 * mergeThs) post = post + 1 - mergeThs
                newRanks.push([{
                    tid: pre,
                    rank: itemRanks[i][pre]['rank'],
                    time: itemRanks[i][pre]['time']
                }, {
                    tid: post,
                    rank: itemRanks[i][Math.min(post, itemRanks[i].length - 1)]['rank'],
                    time: itemRanks[i][Math.min(post, itemRanks[i].length - 1)]['time']
                }])
                //overflowTime = Math.max(overflowTime, post - itemRanks[i].length)
            }
            rankChanges[i] = newRanks

        }

        console.log(JSON.parse(JSON.stringify(rankChanges)))
        for (let i in rankChanges) {
            let newRanks = [fItemRanks[i][0]]
            //console.log(i, 'rank-start', fItemRanks[i][0].rank)
            for (let j = 0; j < rankChanges[i].length; j++) {
                let pre = rankChanges[i][j][0].tid
                let post = rankChanges[i][j][1].tid
                //console.log(i, 'time', j, 'rank-pre', pre)

                //let merged = false
                while (j + 1 < rankChanges[i].length && rankChanges[i][j + 1][0].tid - pre < mergeThs) {
                    j = j + 1
                    //console.log('merge', j)
                    //merged = true
                }
                post = Math.max(Math.max(pre + mergeThs, post), rankChanges[i][j][1].tid)
                //console.log('post', post)
                newRanks.push({
                    tid: pre,
                    rank: itemRanks[i][pre]['rank'],
                    time: itemRanks[i][pre]['time']
                })
                newRanks.push({
                    tid: post,
                    rank: itemRanks[i][Math.min(post, itemRanks[i].length - 1)]['rank'],
                    time: itemRanks[i][Math.min(post, itemRanks[i].length - 1)]['time']
                })
                overflowTime = Math.max(overflowTime, pre + mergeThs - itemRanks[i].length)

            }
            fItemRanks[i] = newRanks

        }
        */

        // 直接合并，合并后还要累加mergeThs
        for (let i in fItemRanks) {
            let newRanks = [fItemRanks[i][0]]
            for (let j = 1; j < fItemRanks[i].length; j++) {
                let pre = fItemRanks[i][j]['tid'] - 1
                //let preRank = itemRanks[i][pre]['rank']
                let post = fItemRanks[i][j]['tid'] - 1 + mergeThs
                //let rise = fItemRanks[i][j]['rank'] - fItemRanks[i][j - 1]['rank']

                while (j + 1 < fItemRanks[i].length
                    && fItemRanks[i][j + 1]['tid'] <= post
                    //&& rise * (fItemRanks[i][j + 1]['rank'] - fItemRanks[i][j]['rank']) > 0
                ) {
                    //pre = fItemRanks[i][j + 1]['tid'] - 1
                    post = fItemRanks[i][j + 1]['tid'] - 1 + mergeThs
                    j = j + 1
                    //console.log(i, j, post)
                }
                //if (post - pre > 2 * mergeThs) post = post + 1 - mergeThs
                newRanks.push({
                    tid: pre,
                    rank: itemRanks[i][pre]['rank'],
                    time: itemRanks[i][pre]['time']
                })
                newRanks.push({
                    tid: post,
                    rank: itemRanks[i][Math.min(post, itemRanks[i].length - 1)]['rank'],
                    time: itemRanks[i][Math.min(post, itemRanks[i].length - 1)]['time']
                })
                overflowTime = Math.max(overflowTime, post - itemRanks[i].length)
            }
            fItemRanks[i] = newRanks
        }


        // 直接合并，合并后不累加mergeThs
        /*
        for (let i in fItemRanks) {
            let newRanks = [fItemRanks[i][0]]
            for (let j = 1; j < fItemRanks[i].length; j++) {
                let pre = fItemRanks[i][j]['tid'] - 1
                let post = fItemRanks[i][j]['tid']

                while (j + 1 < fItemRanks[i].length
                    && fItemRanks[i][j + 1]['tid'] - pre < mergeThs
                ) {
                    j = j + 1
                }
                post = Math.max(pre + mergeThs, fItemRanks[i][j].tid)
                newRanks.push({
                    tid: pre,
                    rank: itemRanks[i][pre]['rank'],
                    time: itemRanks[i][pre]['time']
                })
                newRanks.push({
                    tid: post,
                    rank: itemRanks[i][Math.min(post, itemRanks[i].length - 1)]['rank'],
                    time: itemRanks[i][Math.min(post, itemRanks[i].length - 1)]['time']
                })
                overflowTime = Math.max(overflowTime, post - itemRanks[i].length)
            }
            fItemRanks[i] = newRanks
        }
        */

        /*
        for (let i in fItemRanks) {
            let newRanks = [fItemRanks[i][0]]
            let preRank = fItemRanks[i][0].rank
            for (let j = 1; j < fItemRanks[i].length; j++) {
                let pre = fItemRanks[i][j]['tid'] - 1
                let post = fItemRanks[i][j]['tid'] - 1 + mergeThs
                let postRank = fItemRanks[i][j].rank

                if (j + 1 < fItemRanks[i].length && fItemRanks[i][j + 1]['tid'] < post) {
                    post = fItemRanks[i][j + 1]['tid'] - 1
                    postRank = preRank + (postRank - preRank) * (post - pre) / mergeThs
                }
                newRanks.push({
                    tid: pre,
                    rank: preRank,
                    time: itemRanks[i][pre]['time']
                })
                newRanks.push({
                    tid: post,
                    rank: postRank,
                    time: itemRanks[i][Math.min(post, itemRanks[i].length - 1)]['time']
                })
                overflowTime = Math.max(overflowTime, post - itemRanks[i].length)

                preRank = postRank
            }
            fItemRanks[i] = newRanks
        }
        */

        console.log(JSON.parse(JSON.stringify(fItemRanks)))

        for (let i in fItemRanks) {
            if (fItemRanks[i][fItemRanks[i].length - 1]['tid'] < overflowTime + itemRanks[i].length - 1)
                fItemRanks[i].push({
                    tid: overflowTime + itemRanks[i].length - 1,
                    rank: itemRanks[i][itemRanks[i].length - 1]['rank'],
                    time: itemRanks[i][itemRanks[i].length - 1]['time']
                })
        }
        //console.log(fItemRanks)
        for (let i in fItemRanks) {
            stageData['data'][i]['y'] = []
            let j = 0
            for (j = 0; j < fItemRanks[i].length - 1; j++) {
                let tempD = (fItemRanks[i][j + 1]['tid'] - fItemRanks[i][j]['tid']) * frameMs
                stageData['data'][i]['y'].push({
                    rank: fItemRanks[i][j]['rank'],
                    time: fItemRanks[i][j]['time'],
                    duration: tempD
                })
            }
            stageData['data'][i]['y'].push({
                rank: fItemRanks[i][j]['rank'],
                time: fItemRanks[i][j]['time'],
                duration: 0
            })
        }
        stageData['xDuration'][stageData['xDuration'].length - 2] = overflowTime * frameMs
        //console.log(stageData)
        return stageData
    },
    sortDataForCycle: function (data, showNum, totDuration, valueSwapRatio, frameMs) {
        let newData = [];
        let newNewData = [];
        for (let i = 0; i < data.length; i++) {
            newData[i] = this.copyData(data[i]);
            newNewData[i] = this.copyData(data[i]);
        }
        let reverseMapping = [];
        for (let i = 0; i < data.length; i++) {
            reverseMapping[i] = {};
            for (let j = 0; j < data[i].length; j++) {
                reverseMapping[i][data[i][j]["name"]] = data[i][j]["value"];
            }
        }
        let result = [];
        let result_type = [];
        result.push(
            newData[0].sort((a, b) => {
                return b["value"] - a["value"];
            })
        );
        for (let i = 1; i < newData.length; i++) {
            let pre = newNewData[i].sort((a, b) => {
                return (
                    reverseMapping[i - 1][b["name"]] - reverseMapping[i - 1][a["name"]]
                );
            });
            let post = newData[i].sort((a, b) => {
                return b["value"] - a["value"];
            });
            let tempResult = [pre];
            let tempData = this.copyData(pre);
            while (!this.sameRank(tempData, post, showNum)) {
                let tempDataSave = this.copyData(tempData);
                for (let j = 0; j < tempData.length; j++) {
                    if (tempData[j]["name"] !== post[j]["name"]) {
                        let temp = {};
                        this.copyDatum(temp, tempData[j])
                        let tempj = j;
                        let target = post[j];
                        let nameMoved = {};
                        let nameTarget = {};
                        let elementMove = [];
                        let circleElements = [target];
                        nameMoved[target["name"]] = true;
                        let k;
                        while (temp["name"] !== target["name"]) {
                            for (k = 0; k < tempData.length; k++) {
                                if (tempData[k]["name"] === target["name"]) {
                                    this.copyDatum(tempData[tempj], tempData[k])
                                    elementMove.push([k, tempj]);
                                    circleElements.push(post[k]);
                                    nameTarget[tempData[k]["name"]] = tempj;
                                    nameMoved[post[k]["name"]] = true;
                                    tempj = k;
                                    target = post[k];
                                    break;
                                }
                            }
                        }
                        elementMove.push([j, k]);
                        nameTarget[target["name"]] = k;
                        this.copyDatum(tempData[tempj], target)
                        let moveDownCount = 0,
                            moveUpCount = 0;
                        for (let l = 0; l < elementMove.length; l++) {
                            if (elementMove[l][1] - elementMove[l][0] > 0) {
                                moveDownCount++;
                            } else {
                                moveUpCount++;
                            }
                        }
                        if (moveUpCount === 1) {
                            tempResult.push(this.copyData(tempData));
                        } else if (moveDownCount === 1) {
                            tempResult.push(this.copyData(tempData));
                        } else if (moveDownCount >= moveUpCount) {
                            let lessDirectionMove = [];
                            for (let l = 0; l < elementMove.length; l++) {
                                if (elementMove[l][1] - elementMove[l][0] < 0) {
                                    lessDirectionMove.push(elementMove[l]);
                                }
                            }
                            lessDirectionMove.sort((a, b) => {
                                return a[0] - b[0];
                            });
                            let insert = this.copyData(tempDataSave);
                            for (let l = 0; l < lessDirectionMove.length; l++) {
                                let leadElement = insert[lessDirectionMove[l][0]];
                                let slotIndex = lessDirectionMove[l][0];
                                let elementIndex = lessDirectionMove[l][0] - 1;
                                while (
                                    slotIndex > lessDirectionMove[l][1] &&
                                    elementIndex >= lessDirectionMove[l][1]
                                ) {
                                    if (nameMoved[insert[elementIndex]["name"]] === true) {
                                        insert[slotIndex] = insert[elementIndex];
                                        if (
                                            nameTarget[insert[elementIndex]["name"]] === slotIndex
                                        ) {
                                            nameMoved[insert[elementIndex]["name"]] = false;
                                        }
                                        slotIndex = elementIndex;
                                        elementIndex--;
                                    } else {
                                        elementIndex--;
                                    }
                                }
                                insert[lessDirectionMove[l][1]] = leadElement;
                                nameMoved[leadElement["name"]] = false;
                                tempResult.push(this.copyData(insert));
                            }
                        } else if (moveDownCount < moveUpCount) {
                            let lessDirectionMove = [];
                            for (let l = 0; l < elementMove.length; l++) {
                                if (elementMove[l][1] - elementMove[l][0] > 0) {
                                    lessDirectionMove.push(elementMove[l]);
                                }
                            }
                            lessDirectionMove.sort((a, b) => {
                                return -a[0] + b[0];
                            });
                            let insert = this.copyData(tempDataSave);
                            for (let l = 0; l < lessDirectionMove.length; l++) {
                                let leadElement = insert[lessDirectionMove[l][0]];
                                let slotIndex = lessDirectionMove[l][0];
                                let elementIndex = lessDirectionMove[l][0] + 1;
                                while (
                                    slotIndex < lessDirectionMove[l][1] &&
                                    elementIndex <= lessDirectionMove[l][1]
                                ) {
                                    if (nameMoved[insert[elementIndex]["name"]] === true) {
                                        insert[slotIndex] = insert[elementIndex];
                                        if (
                                            nameTarget[insert[elementIndex]["name"]] === slotIndex
                                        ) {
                                            nameMoved[insert[elementIndex]["name"]] = false;
                                        }
                                        slotIndex = elementIndex;
                                        elementIndex++;
                                    } else {
                                        elementIndex++;
                                    }
                                }
                                insert[lessDirectionMove[l][1]] = leadElement;
                                nameMoved[leadElement["name"]] = false;
                                tempResult.push(this.copyData(insert));
                            }
                        }
                        break;
                    }
                }
            }
            //console.log(tempResult)
            let tempForPush = tempResult[0]
            result.push(tempForPush)
            result_type.push('value')
            for (let j = 1; j < tempResult.length; j++) {
                if (this.sameRank(tempForPush, tempResult[j], showNum)) {
                    continue;
                } else {
                    tempForPush = tempResult[j]
                    result.push(tempForPush)
                    result_type.push('rank')
                }
            }
        }
        //console.log(result)
        //console.log(result_type)
        // 按照rank和value过渡时间的比值，计算过渡时间
        let duration = []
        let resTypeCt = { rank: 0, value: 0 }
        for (let i = 0; i < result_type.length; i++) {
            resTypeCt[result_type[i]]++
        }
        let unitDuration = totDuration / (resTypeCt['value'] * valueSwapRatio + resTypeCt['rank'])
        let valueDuration = Math.floor(unitDuration * valueSwapRatio / frameMs) * frameMs
        let rankDuration = Math.floor(unitDuration / frameMs) * frameMs
        for (let i = 0; i < result_type.length; i++) {
            duration.push(result_type[i] === 'rank' ? rankDuration : valueDuration)
        }
        duration.push(0)
        //console.log(totDuration)
        //console.log(duration)

        for (let i = 0; i < result.length; i++) {
            for (let j = 0; j < result[i].length; j++) {
                result[i][j]['duration-x'] = duration[i]
                result[i][j]['duration-y'] = duration[i]
            }
        }

        let times = []
        let mins = []
        let maxs = []
        for (let i = 0; i < result.length; i++) {
            times.push(result[i][0]['time'])
            mins.push(result[i][0]['min'])
            maxs.push(result[i][0]['max'])
        }

        return helper.dataGroupById(result, mins, maxs, times, duration)
    },
    sameRank: function (r1, r2, ignore = false) {
        let end = ignore ? ignore : r1.length
        for (let i = 0; i < end; i++) {
            if (r1[i]["name"] !== r2[i]["name"]) return false;
        }
        return true;
    },
    copyData: function (data) {
        let tempData = [];
        for (let j = 0; j < data.length; j++) {
            tempData[j] = {};
            for (let k in data[j]) {
                tempData[j][k] = data[j][k]
            }
        }
        return tempData;
    },
    copyDatum: function (a, b) {
        for (let k in b) {
            a[k] = b[k]
        }
    },
    slimData: function (data, objNum) {
        //console.log(data, objNum)
        let newData = this.sortData(data)
        let slim = []
        let exist = {}
        for (let i = 0; i < newData.length; i++) {
            for (let j = 0; j < objNum; j++) {
                exist[newData[i][j]['name']] = true;
            }
        }
        let id = 0
        for (let i in exist) exist[i] = id++;
        for (let i = 0; i < data.length; i++) {
            let temp = [];
            for (let j = 0; j < data[i].length; j++) {
                if (typeof exist[data[i][j]['name']] !== 'undefined') {
                    data[i][j]['id'] = exist[data[i][j]['name']]
                    temp.push(data[i][j])
                }
            }
            slim.push(temp)
        }
        //console.log(slim)
        return slim
    },
    insertMaxMin: function (data) {
        let minArr = [];
        let maxArr = [];
        for (let i = 0; i < data.length; i++) {
            minArr[i] = 0;
            //d3.min(data[i], (d) => {return d["value"];});
            maxArr[i] = d3.max(data[i], (d) => {
                return d["value"];
            });
        }
        let regRes = helper.maxRegression(minArr, maxArr);
        minArr = regRes[0];
        maxArr = regRes[1];
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                data[i][j]['min'] = minArr[i]
                data[i][j]['max'] = maxArr[i]
            }
        }
        return data;
    },

};
let calLayout = {
    init: function (config) {
        this.width = config.width;
        this.height = config.height;
        this.barHeight =
            (config.height * (1 - config.m[2] - config.m[3]) * config.barGapRatio) /
            (config.objNum * config.barGapRatio + config.objNum - 1);
    },
    getCommand: function (config) {
        //let totalNumber = data[0].length;
        let mode = config.mode;
        calLayout.init(config);


        let data = [];
        for (let i = 0; i < config.data.length; i++) {
            data[i] = dataGenerator.copyData(config.data[i]);
        }
        data = dataGenerator.insertMaxMin(data, config.objNum);
        //console.log(data)

        config.animationDuration =
            Math.floor(config.animationDuration / config.frameMs) * config.frameMs;
        let interpolatedData;
        if (mode === "stage") {
            interpolatedData = dataGenerator.sortDataItemWise(data, config.animationDuration, config.frameMs, config.swapTime);
        } else if (mode === "stage-old") {
            let stepData = dataGenerator.linearInterpolation(
                data,
                config.interpolationStepOld
            );
            let newDuration = Math.floor(config.animationDuration / ((config.interpolationStepOld + 1) * config.frameMs)) * config.frameMs
            console.log(newDuration)
            interpolatedData = dataGenerator.sortDataOldStage(stepData, newDuration);
        } else if (mode === "cycle") {
            interpolatedData = dataGenerator.sortDataForCycle(data, config.objNum, config.animationDuration * (data.length - 1), config.valueSwapRatio, config.frameMs);
        }
        //console.log(interpolatedData);

        //let cutted = [interpolatedData[0], interpolatedData[1], interpolatedData[2], interpolatedData[3], interpolatedData[4]]
        let command;
        if (mode === "stage") {
            command = calLayout.dataToElements(
                interpolatedData,
                config
            );
        } else {
            command = calLayout.dataToElements(
                interpolatedData,
                config
            );
        }
        console.log(command);
        return command;
    },

    calcAxis: function (minArr, maxArr, tickNum) {
        let tickValues = [];


        for (let i = 0; i < minArr.length; i++) {
            // D3的tick
            tickValues[i] = d3.ticks(minArr[i], maxArr[i], tickNum);
            // 自定义的tick
            /*
                  tickValues[i] = []
                  let res = helper.get_digits(maxArr[i])
                  let firstDigit = res[0], digits = res[1]
                  let increment = 1
                  if (firstDigit <= 3) {
                      increment = 0.5
                  }
                  for (let tick = increment; tick <= firstDigit; tick += increment) {
                      tickValues[i].push(tick * digits)
                  }
                  */
        }
        let tickByValue = {};
        let maxTickNum = 0;
        for (let i = 0; i < minArr.length; i++) {
            maxTickNum = Math.max(maxTickNum, tickValues[i].length);
            for (let j = 0; j < tickValues[i].length; j++) {
                if (typeof tickByValue[tickValues[i][j]] === "undefined") {
                    tickByValue[tickValues[i][j]] = [];
                    for (let ii = 0; ii < minArr.length; ii++) {
                        tickByValue[tickValues[i][j]][ii] = 1e-6;
                    }
                }
                tickByValue[tickValues[i][j]][i] = 1;
            }
        }
        return [tickByValue, maxTickNum];
    },
    calcX: function (value, max, width, m) {
        return width * (1 - m[0] - m[1]) * value / max + width * m[0]
    },
    extractDuration: function (data, key = 'duration') {
        let duration = []
        for (let i = 0; i < data.length; i++) {
            duration.push(data[i][key])
        }
        return duration;
    },
    dataToElements: function (
        packData,
        config,
    ) {
        //console.log(data)
        //console.log(animationDuration)

        let elementArray = [];
        let minArr = packData['min'];
        let maxArr = packData['max'];
        let xDuration = packData['xDuration']
        let time = packData['time']
        let data = packData['data']

        let calcAxisRes = this.calcAxis(minArr, maxArr, config.tickNum);
        //console.log(calcAxisRes)
        let tickByValue = calcAxisRes[0];
        let maxTickNum = calcAxisRes[1];

        // -------------------- axis --------------------
        let tickTextLen = 5;
        let fontSize = this.barHeight * config.axisNumberSize;
        if (
            this.width * (1 - config.m[0] - config.m[1]) <
            maxTickNum * tickTextLen * fontSize
        ) {
            fontSize =
                (this.width * (1 - config.m[0] - config.m[1])) /
                (maxTickNum * tickTextLen);
        }
        for (let j in tickByValue) {
            let line = {
                attr: {
                    "x1": { d: [], t: xDuration },
                    "x2": { d: [], t: xDuration },
                },
                style: {
                    "stroke-opacity": { d: [], t: xDuration },
                }
            };
            let text = {
                attr: {
                    transform: { d: [], t: xDuration }
                },
                style: {
                    "fill-opacity": { d: [], t: xDuration },
                }
            };

            for (let i = 0; i < maxArr.length; i++) {
                line.attr.x1.d.push(this.calcX(j, maxArr[i], config.width, config.m))
                line.attr.x2.d.push(this.calcX(j, maxArr[i], config.width, config.m))
                line.style['stroke-opacity'].d.push(tickByValue[j][i])
                text.attr.transform.d.push(helper.toTransform(
                    this.calcX(j, maxArr[i], config.width, config.m),
                    (this.height * (1 - config.m[3]) + this.barHeight * 1.2)))
                text.style["fill-opacity"].d.push(tickByValue[j][i])
            }
            elementArray.push({
                type: "line",
                class: config.numLineClass,
                attributes: line,
                static: {
                    attr: {
                        'y1': this.height * config.m[2] - this.barHeight * 0.4,
                        'y2': this.height * (1 - config.m[3]) + this.barHeight * 0.4
                    }, style: {
                        'stroke-width': config.barStrokeWidth,
                        stroke: config.axisLineFill
                    }
                }
            });
            elementArray.push({
                type: "text",
                class: config.numLableClass,
                attributes: text,
                static: {
                    text: j,
                    attr: {
                    },
                    style: {
                        'font-size': fontSize,
                        fill: config.axisTextFill,
                        'text-anchor': 'middle',
                        'dominant-baseline': 'central',
                        'font-weight': 700,
                    }
                }
            });
        }

        // -------------------- timeLabel --------------------
        let timeLabel = {
            text: { d: [], t: xDuration },
            attr: {
            },
            style: {
            }
        };
        for (let i = 0; i < time.length; i++) {
            timeLabel.text.d.push(time[i])
        }
        elementArray.push({
            name: "timeLabel",
            class: config.timeLabelClass,
            type: "text",
            attributes: timeLabel,
            static: {
                attr: {
                    transform: helper.toTransform(
                        this.width * (1 - config.timeTextRight),
                        (this.height * config.timeTextTop))
                }, style: {
                    "font-size": this.barHeight * config.timeTextSize,
                    fill: "#aaa",
                    "fill-opacity": 1,
                    'text-anchor': 'end',
                    'dominant-baseline': 'central',
                    'font-weight': 700,
                }
            }
        });
        //console.log(config.colors)

        // -------------------- Bar chart elements --------------------
        for (let i in data) {
            let yDuration = this.extractDuration(data[i]['y'])
            let rect = helper.newElement('rect', xDuration, yDuration)
            let text1 = helper.newElement('static-text', xDuration, yDuration)
            let text2 = helper.newElement('static-text2', xDuration, yDuration)
            let text3 = helper.newElement('dynamic-text', xDuration, yDuration)
            let fill = config.colors[i]
            //console.log(i, fill)
            let name = data[i]["name"]
            for (let j = 0; j < data[i]['y'].length; j++) {
                let item = data[i]['y'][j]
                let fillOpacity = 1;
                if (item['rank'] >= config.objNum) {
                    fillOpacity = 1e-6;
                }
                let textY = this.height * config.m[2] +
                    ((item['rank'] * (config.barGapRatio + 1)) / config.barGapRatio) *
                    this.barHeight +
                    this.barHeight / 2

                // --------------- 条形 ---------------
                rect.attr.y.d.push(this.height * config.m[2] +
                    ((item['rank'] * (config.barGapRatio + 1)) / config.barGapRatio) *
                    this.barHeight)
                rect.style["fill-opacity"].d.push(fillOpacity)

                // --------------- 文字标注1 条形外文本 ---------------
                text1.attr.transformOri.dy.push(textY)
                text1.style["fill-opacity"].d.push(fillOpacity)
                text1.style["stroke-opacity"].d.push(fillOpacity)

                // --------------- 文字标注2 条形内文本 ---------------
                if (config.showBarInnerLabel) {
                    text2.attr.transformOri.dy.push(textY)
                    text2.style["opacityOri"].dy.push(fillOpacity)
                }

                // --------------- 文字标注3 条形外数字 ---------------
                text3.attr.transformOri.dy.push(textY)
                text3.style["fill-opacity"].d.push(fillOpacity)
                text3.style["stroke-opacity"].d.push(fillOpacity)
            }
            for (let j = 0; j < data[i]['x'].length; j++) {
                let item = data[i]['x'][j]

                // --------------- 条形 ---------------
                rect.value.d.push(item["value"])
                rect.attr.width.d.push(this.calcX(item["value"], item['max'], config.width, config.m) - this.width * config.m[0])

                // --------------- 文字标注1 ---------------
                // 位于bar的左外侧
                text1.attr.transformOri.dx.push(
                    (this.width * config.m[0] - this.barHeight * 0.5))

                // --------------- 文字标注2 ---------------
                if (config.showBarInnerLabel) {
                    // 位于bar内的右侧
                    text2.attr.transformOri.dx.push((this.calcX(item["value"], item['max'], config.width, config.m) - this.barHeight * 0.5))

                    let text2Opacity = 1;
                    // bar宽度不够，则不显示文字标注2
                    if (
                        this.calcX(item["value"], item['max'], config.width, config.m) -
                        2 * this.barHeight -
                        this.width * config.m[0] <
                        name.length * this.barHeight * config.barInnerLabelSize
                    ) {
                        text2Opacity = 1e-6;
                    }
                    text2.style["opacityOri"].dx.push(text2Opacity)
                }

                // --------------- 文字标注3 ---------------
                // 位于bar的右外侧
                text3.attr.transformOri.dx.push((this.calcX(item["value"], item['max'], config.width, config.m) + this.barHeight * 0.5))

                let fontSize = this.barHeight * config.barOuterNumberSize;
                if (
                    this.width - this.calcX(item["value"], item['max'], config.width, config.m) - this.barHeight <
                    helper.formatter(item["value"], config.locale, config.labelPrecision[config.locale]).length * fontSize
                ) {
                    //console.log(helper.formatter(item["value"]).length);
                    fontSize =
                        (this.width - this.calcX(item["value"], item['max'], config.width, config.m) - this.barHeight) /
                        helper.formatter(item["value"], config.locale, config.labelPrecision[config.locale]).length;
                }
                text3.style["font-size"].d.push(fontSize)

                text3.text.d.push(item["value"])
            }
            elementArray.push({
                name,
                class: config.barClass,
                type: "rect",
                attributes: rect,
                static: {
                    attr: {
                        x: this.width * config.m[0],
                        height: this.barHeight,
                        rx: this.barHeight * config.barRoundCorner,
                        ry: this.barHeight * config.barRoundCorner
                    }, style: {
                        fill,
                    }
                }
            });
            let fontSize = this.barHeight * config.barOuterLabelSize;
            if (
                this.width * config.m[0] - this.barHeight <
                name.length * fontSize
            ) {
                fontSize =
                    (this.width * config.m[0] - this.barHeight) /
                    name.length;
            }
            elementArray.push({
                name,
                class: config.barTextClass,
                type: "text",
                attributes: text1,
                static: {
                    text: name,
                    attr: {}, style: {
                        'font-size': fontSize,
                        fill,
                        'text-anchor': "end",
                        "dominant-baseline": "central",
                        "font-weight": 700,
                    }
                }
            });
            if (config.showBarInnerLabel) {
                elementArray.push({
                    name,
                    class: config.barTextClassB,
                    type: "text",
                    attributes: text2,
                    static: {
                        text: name,
                        attr: {}, style: {
                            fill,
                            'font-size': this.barHeight * config.barInnerLabelSize,
                            'stroke': config.textStroke,
                            'stroke-width': config.textStrokeWidth,
                            'text-anchor': "end",
                            "dominant-baseline": "central",
                            "font-weight": 700,

                        }
                    }
                });
            }
            elementArray.push({
                name,
                class: config.barNumLableClass,
                type: "text",
                attributes: text3,
                static: {
                    attr: {}, style: {
                        fill,
                        'text-anchor': "begin",
                        "dominant-baseline": "central",
                        "font-weight": 700,
                    }
                }
            });

        }

        //console.log(JSON.parse(JSON.stringify(elementArray[0])))
        //console.log(JSON.parse(JSON.stringify(duration)))
        //let customCubic = d3.easeLinear;
        let customCubic = d3.easePoly.exponent(4);

        let timeTooltip = []
        let itpLen = []
        for (let j = 0; j < elementArray.length; j++) {
            for (let attr of ["attr", "style"]) {
                for (let i in elementArray[j]["attributes"][attr]) {
                    let itpArray = []
                    let k;
                    let ele = elementArray[j]["attributes"][attr][i]
                    //console.log(ele)
                    if (i === 'transformOri') {
                        let itpArrayX = [], itpArrayY = [];
                        for (k = 0; k < ele['tx'].length - 1; k++) {
                            let itpX = d3.interpolate(ele['dx'][k], ele['dx'][k + 1])
                            for (let l = 0; l < ele['tx'][k]; l += config.frameMs) {
                                itpArrayX.push(itpX((l / ele['tx'][k])))
                            }
                        }
                        itpArrayX.push(ele['dx'][k])
                        for (k = 0; k < ele['ty'].length - 1; k++) {
                            let itpY = d3.interpolate(ele['dy'][k], ele['dy'][k + 1])
                            for (let l = 0; l < ele['ty'][k]; l += config.frameMs) {
                                itpArrayY.push(itpY(customCubic(l / ele['ty'][k])))
                            }
                        }
                        itpArrayY.push(ele['dy'][k])
                        for (let k = 0; k < itpArrayX.length; k++) {
                            itpArray.push(helper.toTransform(itpArrayX[k], itpArrayY[k]));
                        }
                        itpLen.push([attr, "transform", itpArray.length])
                        elementArray[j]["attributes"][attr]["transform"] = itpArray
                    } else if (i === 'opacityOri') {
                        let itpArrayX = [], itpArrayY = [];
                        for (k = 0; k < ele['tx'].length - 1; k++) {
                            let itpX = d3.interpolate(ele['dx'][k], ele['dx'][k + 1])
                            for (let l = 0; l < ele['tx'][k]; l += config.frameMs) {
                                itpArrayX.push(itpX((l / ele['tx'][k])))
                            }
                        }
                        itpArrayX.push(ele['dx'][k])
                        for (k = 0; k < ele['ty'].length - 1; k++) {
                            let itpY = d3.interpolate(ele['dy'][k], ele['dy'][k + 1])
                            for (let l = 0; l < ele['ty'][k]; l += config.frameMs) {
                                itpArrayY.push(itpY(customCubic(l / ele['ty'][k])))
                            }
                        }
                        itpArrayY.push(ele['dy'][k])
                        for (let k = 0; k < itpArrayX.length; k++) {
                            itpArray.push(Math.min(itpArrayX[k], itpArrayY[k]));
                        }
                        itpLen.push([attr, "fill-opacity", itpArray.length])
                        itpLen.push([attr, "stroke-opacity", itpArray.length])
                        elementArray[j]["attributes"][attr]["fill-opacity"] = itpArray
                        elementArray[j]["attributes"][attr]["stroke-opacity"] = itpArray
                    } else {
                        for (k = 0; k < ele['d'].length - 1; k++) {
                            let itp = d3.interpolate(ele['d'][k], ele['d'][k + 1])
                            for (let l = 0; l < ele['t'][k]; l += config.frameMs) {
                                if (elementArray[j]['type'] === 'rect' && i === 'y')
                                    itpArray.push(itp(customCubic(l / ele['t'][k])))
                                else
                                    itpArray.push(itp((l / ele['t'][k])))
                                //itpArray.push(itp(customCubic(l / ele['t'][k])))
                            }
                        }
                        itpArray.push(ele['d'][k])
                        itpLen.push([attr, i, itpArray.length])
                        elementArray[j]["attributes"][attr][i] = itpArray
                    }
                }
            }
            if (elementArray[j]["type"] === "text") {
                if (typeof elementArray[j]["attributes"]["text"] !== 'undefined') {
                    let itpArray = []
                    let k;
                    let ele = elementArray[j]["attributes"]["text"];
                    for (k = 0; k < ele['d'].length - 1; k++) {
                        let itp = d3.interpolate(ele['d'][k], ele['d'][k + 1])
                        for (let l = 0; l < ele['t'][k]; l += config.frameMs) {
                            if (elementArray[j]["class"] === config.barNumLableClass) {
                                itpArray.push(helper.formatter(Number(itp(l / ele['t'][k])), config.locale, config.labelPrecision[config.locale], false))
                            } else if (elementArray[j]["class"] === config.timeLabelClass) {
                                itpArray.push(helper.dateformatDash(new Date(itp(l / ele['t'][k]))))
                            } else {
                                itpArray.push(itp(l / ele['t'][k]))
                            }
                        }
                    }
                    if (elementArray[j]["class"] === config.barNumLableClass) {
                        itpArray.push(helper.formatter(Number(ele['d'][k]), config.locale, config.labelPrecision[config.locale]))
                    } else if (elementArray[j]["class"] === config.timeLabelClass) {
                        itpArray.push(helper.dateformatDash(new Date(ele['d'][k])))
                        timeTooltip = itpArray
                    } else {
                        itpArray.push(ele['d'][k])
                    }
                    itpLen.push(["text", "text", itpArray.length])
                    elementArray[j]["attributes"]["text"] = itpArray
                } else {
                    if (elementArray[j]["class"] === config.numLableClass) {
                        elementArray[j]["static"]["text"] = (helper.formatter(elementArray[j]["static"]["text"], config.locale, config.labelPrecision[config.locale], true))
                    } else if (elementArray[j]["class"] === config.barNumLableClass) {
                        elementArray[j]["static"]["text"] = (helper.formatter(elementArray[j]["static"]["text"], config.locale, config.labelPrecision[config.locale]))
                    } else if (elementArray[j]["class"] === config.timeLabelClass) {
                        elementArray[j]["static"]["text"] = (helper.dateformatDash(elementArray[j]["static"]["text"], config.locale))
                    }
                }
            }
        }
        //console.log(itpLen)

        //console.log(elementArray)
        let newDuration = []
        for (let i = 0; i < itpLen[0][2]; i++) {
            newDuration.push(config.frameMs)
        }
        let command = {
            type: "element",
            duration: newDuration,
            timeTooltip,
            elements: elementArray,
        };

        /*
        let res_for_CSV = ''
        for (let i in command['elements']) {
            if (command['elements'][i]['class'] === 'dynamic-bar') {
                res_for_CSV = res_for_CSV + (JSON.stringify(command['elements'][i].attributes.attr.y) + '\n')
            }
        }
        console.log(res_for_CSV)
        */



        return command;
    },
};


function wrappedCommandGenerator(
    userConfig,
    parsedSheet,
    useRowAsItem
) {
    // userConfig必须包含的参数
    //mode: "cycle", 可选cycle(强调交换), stage(立即交换), stage-old(平滑过渡)
    //animationDuration: 2000, 每个时间步的时长
    //valueSwapRatio: 1, cycle模式下需要
    //swapTime: 200, stage模式下需要
    //interpolationStepOld: 0, stage-old模式下需要
    //objNum: 10, 显示bar的个数
    //color: [],
    //title: "",
    //author: "",
    //locale: "zh"
    //width: 1000,
    //height: 500,
    let nameRC;
    if (useRowAsItem) { nameRC = "row" } else { nameRC = "column" };
    let res = tableToJSON(parsedSheet, nameRC);
    if (res.success) {
        let data = res.data;
        // slimData是深拷贝
        let slimedData = dataGenerator.slimData(data, userConfig.objNum);
        userConfig.data = slimedData;
        // 颜色的数量是所有出现过的bar的数量，可能大于objNum
        if (typeof userConfig.colors === "undefined")
            userConfig.colors = color.generateColor2(slimedData[0].length);
        if (typeof userConfig.width === "undefined") userConfig.width = 1080;
        if (typeof userConfig.height === "undefined") userConfig.height = 720;
        //console.log(userConfig.data);
        for (let i in userConfig) {
            config[i] = userConfig[i];
        }
        //console.log(config);
        return calLayout.getCommand(config);
    }
    return false;
}

onmessage = function (event) {
    let userConfig = event.data.userConfig;
    let parsedSheet = event.data.parsedSheet;
    let rowAsItem = event.data.useRowAsItem;
    let command = wrappedCommandGenerator(userConfig, parsedSheet, rowAsItem);

    postMessage(command);
}