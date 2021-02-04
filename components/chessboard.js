/**
 * 棋盘组件，游戏的主体部分，包含由两次出现的词组组成的棋盘和计时器
 * 
 */
Vue.component("chessboard", {
    data() {
        return {
            timer: 0,           // 计数器对象（setInterval的返回值）
            seconds: 0,         // 当前用时，整数，单位为秒
            timerOn: false,     // 是否已经开始计时。按下第一个按钮，则开始计时。

            ROW: 10,            // 棋盘行数为10
            COL: 4,             // 棋盘列数为4
            total: 400,         // 棋子总数
            doubleContents: [], // 重复并且乱序的词组数组，用于显示连连看棋盘的内容，10 * 4
            preRow: -1,         // 上次点击的词组的行
            preCol: -1,         // 上次点击的词组的列
            states: [],         // 10 * 4个棋子的状态。""-未选中，"primary"-已选中，"info"-已配对，"danger"-配对失败
            counter: 0,         // 配对成功的个数，达到40时停止计时
            error: 0,           // 匹配错误的次数
        };
    },
    props: {
        contents: Array,        // 20个互不相同的词组
    },
    created() {
        this.doubleContents = this.contents;
        this.doubleContents = this.doubleContents.concat(this.doubleContents);      // 每个词组出现2次
        this.doubleContents = this.shuffle(this.doubleContents);                    // 打乱词组数组

        this.states = new Array(this.ROW * this.COL).fill("");

        this.total = this.ROW * this.COL;
    },
    methods: {
        addOneSecond() {
            ++this.seconds;
        },
        startTimer() {
            this.seconds = 0;
            this.timer = setInterval(this.addOneSecond, 1000);                      // 每秒（1000毫秒）更新计时器
        },
        shuffle(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;
            
            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
            
                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
            
                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }
            
            return array;
        },
        getTextFromPosition(row, col) {
            return this.doubleContents[row * this.COL + col];
        },
        handleClick(row, col) {
            curContent = this.doubleContents[row * this.COL + col];
            if (this.preRow === -1 && this.preCol === -1) { 
                if (!this.timerOn) {
                    this.timerOn = true;
                    this.startTimer();
                }    
                // 第一次点击或上次已配对，当前棋子变成“选中”状态
                this.states[row * this.COL + col] = "primary";
                this.preRow = row;
                this.preCol = col;
            } else if (this.doubleContents[row * this.COL + col] === this.doubleContents[this.preRow * this.COL + this.preCol]) {
                // 配对成功，一对棋子变成“已配对”状态
                console.log("sucess");
                this.states[row * this.COL + col] = this.states[this.preRow * this.COL + this.preCol] = "info";
                this.preRow = this.preCol = -1;
                this.counter += 2;
            } else {
                // 配对错误
                console.log("fail");
                ++this.error;
            }
            if (this.counter === this.total) {
                console.log('Done!');
                clearInterval(this.timer);
            }
            this.$forceUpdate();
        },
        getStateFromPosition(row, col) {
            return this.states[row * this.COL + col];
        },
        backToPreviousState(row, col, preState) {
            this.states[row * this.COL + col] = preState;
        }
    },
    computed: {
        getButtonColWidth() {
            return 24 / this.COL;
        },
    },
    template: '<div>\
        <el-row>\
            <el-col :span="12" id="center-item">\
                用时: {{seconds}} 秒\
            </el-col>\
            <el-col :span="12" id="center-item">\
                错误: {{error}} 个\
            </el-col>\
        </el-row>\
        <el-row id="center-item" v-for="(row, rowid) in Array.from(new Array(ROW).keys())" :key="rowid">\
            <el-button-group>\
                <el-button v-for="(col, colid) in Array.from(new Array(COL).keys())" :key="colid" plain @click="handleClick(row, col)" :type="getStateFromPosition(row, col)">{{getTextFromPosition(row, col)}}</el-button>\
            </el-button-group>\
        </el-row>\
    </div>'
});