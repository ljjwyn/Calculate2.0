/**
 * NG控制器 taskManagementCtrl.js 2018-07-23 22:55
 *
 * @author Wang Xiaodong
 */
var taskManagementFunc = function ($scope, $http) {

    $scope.taskList = [{
        taskId: 'T00001',
        taskName: '测试任务',
        creator: 'dataworker',
    }];

    // 当前任务
    $scope.currentTask = undefined;

    // 查看任务输出按钮禁用，除非该任务执行完成
    $scope.viewTaskBtnStatus = false;

    // 任务输出默认隐藏
    $scope.taskOuputDivVisible = false;

    // 类别特征默认隐藏
    $scope.dataFeaturesDivVisible = false;

    // 输出数据默认隐藏
    $scope.dataOuputDivVisible = false;

    // 任务输出可视化默认隐藏
    $scope.taskChartDivVisible = false;

    // 当前任务执行结束后生成的标签ID和标签值（如未自定义则为NoLabel）
    $scope.currentTaskOutputLables = undefined;

    //类别预测结果
    $scope.clusterPredictedDivVisible = false;
    $scope.clusterPredictedPanelVisible = true;
    $scope.featurePanelState = "展开";

    $scope.outputPanelState = "展开";

    $scope.visualizationState = "展开";

    $scope.predictPanelState = "收起";
    /**
     * 列出所有分布式聚类任务
     */
    var getDistributedClusteringTasks = $scope.getDistributedClusteringTasks = function () {
        console.log("[INFO] You are getting tasks");
        // 任务输出隐藏
        $scope.taskOuputDivVisible = false;
        // 任务输出可视化隐藏
        $scope.taskChartDivVisible = false;

        $http({
            method: 'GET',
            url: 'clustering/tasks',
        }).then(function (resp, status) {
            $scope.taskList = resp.data;
            $scope.taskList.forEach(function (item, index, arr) {
                if (item.isFinished == 1) {
                    item['btnStatus'] = '已完成';
                } else {
                    if (item.progress == '未启动' || item.progress == '已终止' || item.progress == '任务失败') {
                        item['btnStatus'] = '启 动';
                    } else {
                        item['btnStatus'] = '正在运行';
                    }
                }
            });

            console.log("[INFO] Task list includes: ");
            console.log(resp.data);
            $scope.status = status;
        }, function (resp, status) {
            $scope.resp = resp;
            $scope.status = status;
        });
    };

    /**
     * 显示当前任务信息
     */
    $scope.showTaskInfo = function (task) {
        $scope.currentTask = task;
        $scope.focus = task.taskId;

        console.log("[INFO] Current task is " + task.taskId + "#"
            + task.taskName);

        // 任务输出隐藏
        $scope.taskOuputDivVisible = false;

        // 任务输出可视化隐藏
        $scope.taskChartDivVisible = false;
        $scope.viewTaskBtnStatus = false;
        $scope.dataFeaturesDivVisible = false;

        if (task.isFinished == 1) {
            $scope.viewTaskBtnStatus = true;
        }

        console.log($scope.focus);
    };

    /**
     * 启动任务
     */
    $scope.startTask = function (task) {
        console.log("[START TASK] You want start the task whose id is "
            + task.taskId);
        if (task.progress != '未启动') {
            console.log("[STATUS] The task is running of " + task.progress);
            return;
        }

        $http(
            {
                method: 'POST',
                url: 'clustering/tasks/'
                + task.taskId + '/status',
            }).then(function (resp, status) {
            $scope.resp = resp;
            $scope.status = status;
            getDistributedClusteringTasks();
        }, function (resp, status) {
            $scope.resp = resp;
            $scope.status = status;
            getDistributedClusteringTasks();
        });
    };

    /**
     * 删除任务
     *
     */
    $scope.delTask = function (task) {
        console.log("[DELETE TASK] You are deletting the task whose id is "
            + task.taskId);
        $http(
            {
                method: 'DELETE',
                url: 'clustering/tasks/'
                + task.taskId
            }).then(function (resp, status) {
            getDistributedClusteringTasks();
        }, function (resp, status) {
            getDistributedClusteringTasks();
        });
    };


    /**
     * 修改任务
     *
     */
    $scope.changeTaskInfo = function (task) {
        console.log("[UPDATE TASK] You are update the task whose id is "
            + task.taskId);
        $http(
            {
                method: 'PUT',
                url: 'clustering/tasks/'
                + task.taskId,
                headers : {
                    'Content-Type' : 'application/json',
                },
                data : $scope.currentTask,
            }).then(function (resp, status) {
                console.log($scope.currentTask);
            getDistributedClusteringTasks();
        }, function (resp, status) {
            getDistributedClusteringTasks();
        });
    };


    /**
     * 查看任务输出 - 获取任务聚类结果（未定义标签前）
     */
    var getTaskOutputLabels = $scope.getTaskOutputLabels = function (task) {
        console.log("[GET TASK RESULT] You are getting the task whose id is "
            + task.taskId);


        if ($scope.taskOuputDivVisible){
            $scope.taskOuputDivVisible = false;
        }
        else {

            $http(
                {
                    method: 'GET',
                    url: 'clustering/tasks/'
                    + task.taskId + '/labels'
                })
                .then(
                    function (resp, status) {

                        // 显示隐藏的任务输出控件
                        $scope.taskOuputDivVisible = true;

                        var currentTaskOutputLables = $scope.currentTaskOutputLables = resp.data;
                        $scope.newTaskOutputLables = new Object();
                        for (var key in currentTaskOutputLables) {
                            $scope.newTaskOutputLables[key] = currentTaskOutputLables[key];
                        }
                        $scope.getFeaturesData(task);
                        $scope.featurePanelState = "收起";
                        $scope.dataFeaturesDivVisible = true;
                        $scope.pointToPredict = null;
                        $scope.clusterPredictedDivVisible = false;
                        console.log(resp.data);
                        $scope.status = status;
                    }, function (resp, status) {
                        $scope.resp = resp;
                        $scope.status = status;
                    });
        }

    };

    /**
     * 标签表中表单更新触发
     */
    $scope.setLabelInput = function (key, newValue) {
        $scope.newTaskOutputLables[key] = newValue;
        console.log("[SET LABEL] " + $scope.newTaskOutputLables);
    };

    /**
     * 上传保存自定义聚类标签
     */
    $scope.saveClusteringLabels = function (task) {
        console
            .log("[SAVE LABEL] You are saving labels for the task whose id is "
                + task.taskId);
        $http(
            {
                method: 'POST',
                url: 'clustering/tasks/'
                + task.taskId + '/labels',
                data: $scope.newTaskOutputLables
            }).then(function (resp, status) {
            console.log(resp.data);
            $scope.currentTaskOutputLables = resp.data;

            $scope.dataFeaturesDivVisible = false;
            $scope.dataOuputDivVisible = false;
            $scope.taskChartDivVisible = false;
            $scope.featurePanelState = "展开";
            $scope.outputPanelState = "展开";
            $scope.visualizationState = "展开";

            $scope.status = status;
        }, function (resp, status) {
            $scope.resp = resp;
            $scope.status = status;
        });
    };


    $scope.showClusterPredict = function () {
        if ($scope.clusterPredictedPanelVisible == true){
            $scope.clusterPredictedPanelVisible = false;
            $scope.predictPanelState = "展开";
        }
        else {
            $scope.clusterPredictedPanelVisible = true;
            $scope.predictPanelState = "收起";
        }
    }

    /**
     * 预测类别
     */
    $scope.clusterPredict = function (pointToPredict, task) {
        console
            .log("[Predict Cluster] You are predict cluster for the task whose id is "
                + task.taskId);
        $scope.pointToPredict = pointToPredict;

        $scope.clusterPredictedDivVisible = false;
        var pointStr = "";
        for (var item in pointToPredict){
            pointStr += pointToPredict[item] + ",";
        }
        pointStr.substring(0, pointStr.length - 1);

        $http(
            {
                method: 'POST',
                url: 'analysis/predict/'
                + task.taskId,
                data: {"point": pointStr}
            }).then(function (resp, status) {
            console.log(resp.data);
            $scope.clusterPredictedDivVisible = true;
            $scope.predictedCluster = resp.data;
            console.log($scope.predictedCluster);
            $scope.initRadarChart();
        }, function (resp, status) {
            $scope.resp = resp;
            $scope.status = status;
        });
    };



    $scope.initRadarChart = function (){

                    var index = $scope.predictedCluster["pointNum"];
                    console.log( $scope.featureMeta);
                    console.log($scope.pointToPredict);
                    var max = new Array();
                    var avg = new Array();

                    var data = new Array();
                    for (var item in $scope.pointToPredict){
                        data.push($scope.pointToPredict[item]);
                    }
                    for (var item in $scope.featuresRawData[index]){
                        max.push({"max": $scope.featuresRawData[index][item]["max"],
                            "name": $scope.featureMeta[item].name});
                        avg.push($scope.featuresRawData[index][item]["avg"]);
                    }

                    console.log(avg);

                    var option = {
                        backgroundColor: '#fafafa',
                        tooltip: {},

                        legend: {                        // 图例组件
                            show: true,
                            itemWidth: 10,                  // 图例标记的图形宽度。[ default: 25 ]
                            itemHeight: 10,                 // 图例标记的图形高度。[ default: 14 ]
                            itemGap: 30,                	// 图例每项之间的间隔。[ default: 10 ]横向布局时为水平间隔，纵向布局时为纵向间隔。
                            orient: 'horizontal',             // 图例列表的布局朝向,'horizontal'为横向,''为纵向.

                        },

                        radar: [{                       // 雷达图坐标系组件，只适用于雷达图。
                            center: ['50%', '50%'],             // 圆中心坐标，数组的第一项是横坐标，第二项是纵坐标。[ default: ['50%', '50%'] ]
                            radius: 160,                        // 圆的半径，数组的第一项是内半径，第二项是外半径。
                            startAngle: 90,                     // 坐标系起始角度，也就是第一个指示器轴的角度。[ default: 90 ]
                            name: {                             // (圆外的标签)雷达图每个指示器名称的配置项。
                                formatter: '{value}',
                                textStyle: {
                                    fontSize: 15,
                                    color: '#292929'
                                }
                            },
                            nameGap: 20,                        // 指示器名称和指示器轴的距离。[ default: 15 ]
                            splitNumber: 5,                     // (这里是圆的环数)指示器轴的分割段数。[ default: 5 ]
                            shape: 'polygon',                    // 雷达图绘制类型，支持 'polygon'(多边形) 和 'circle'(圆)。[ default: 'polygon' ]
                            axisLine: {                         // (圆内的几条直线)坐标轴轴线相关设置
                                lineStyle: {
                                    color: '#fff',                   // 坐标轴线线的颜色。
                                    width: 1,                      	 // 坐标轴线线宽。
                                    type: 'solid',                   // 坐标轴线线的类型。
                                }
                            },
                            splitLine: {                        // (这里是指所有圆环)坐标轴在 grid 区域中的分隔线。
                                lineStyle: {                    // 分隔线颜色
                                    width: 0.5, 							 // 分隔线线宽
                                }
                            },
                            splitArea: {                        // 坐标轴在 grid 区域中的分隔区域，默认不显示。
                                show: true,
                                areaStyle: {                            // 分隔区域的样式设置。
                                    color: ['rgba(250,250,250,0.3)','rgba(200,200,200,0.3)'],       // 分隔区域颜色。分隔区域会按数组中颜色的顺序依次循环设置颜色。默认是一个深浅的间隔色。
                                }
                            },
                            indicator: max
                        }],
                        series: [{         // 系列名称,用于tooltip的显示，legend 的图例筛选，在 setOption 更新数据和配置项时用于指定对应的系列。
                            type: 'radar',              // 系列类型: 雷达图
                            itemStyle: {                // 折线拐点标志的样式。
                                normal: {                   // 普通状态时的样式
                                    lineStyle: {
                                        width: 1
                                    },
                                    opacity: 0.3
                                },
                                emphasis: {                 // 高亮时的样式
                                    lineStyle: {
                                        width: 5
                                    },
                                    opacity: 1
                                }
                            },
                            data: [{                    // 雷达图的数据是多变量（维度）的
                                name: '类别均值',                 // 数据项名称
                                value: avg,        // 其中的value项数组是具体的数据，每个值跟 radar.indicator 一一对应。
                                symbol: 'circle',                   // 单个数据标记的图形。
                                symbolSize: 5,                      // 单个数据标记的大小，可以设置成诸如 10 这样单一的数字，也可以用数组分开表示宽和高，例如 [20, 10] 表示标记宽为20，高为10。
                                label: {                    // 单个拐点文本的样式设置
                                    normal: {
                                        show: true,             // 单个拐点文本的样式设置。[ default: false ]
                                        position: 'top',        // 标签的位置。[ default: top ]
                                        formatter:function(params) {
                                            return params.value;
                                        }
                                    }
                                },
                                lineStyle: {                // 单项线条样式。
                                    normal: {
                                        opacity: 0.5            // 图形透明度
                                    }
                                },
                                areaStyle: {                // 单项区域填充样式
                                    normal: {
                                        color: "#cd6a67"       // 填充的颜色。[ default: "#000" ]
                                    }
                                }
                            }, {
                                name: '用户数据',
                                value: data,
                                symbol: 'circle',
                                symbolSize: 5,
                                label: {
                                    normal: {
                                        show: true,
                                        position: 'top',
                                        formatter:function(params) {
                                            return params.value;
                                        }
                                    }
                                },
                                lineStyle: {
                                    normal: {
                                        opacity: 0.5
                                    }
                                },
                                areaStyle: {
                                    normal: {
                                        color: '#2f4554'
                                    }
                                }
                            }]
                        }, ]
                    };


                    var echartsWarp = document.getElementById("radarChart");
                    var resizeWorldMapContainer = function () {//用于使chart自适应高度和宽度,通过窗体高宽计算容器高宽
                        echartsWarp.style.width = window.innerWidth*0.90+'px';
                        echartsWarp.style.height = window.innerHeight*0.9+'px';
                    };

                    resizeWorldMapContainer ();//设置容器高宽

                    var myChart = echarts.init(echartsWarp);// 基于准备好的dom，初始化echarts实例

                    myChart.setOption(option);


                }




    /**
     * 获取任务输出数据
     */
    $scope.getClusteringOutputRawData = function (task) {
        console
            .log("[GET OUTPUT RAWDATA] You are getting Output RawData of the task whose id is "
                + task.taskId);
        if ($scope.dataOuputDivVisible){
            $scope.dataOuputDivVisible = false;
            $scope.outputPanelState = "展开";
        }
        else{
            $http(
                {
                    method: 'GET',
                    url: 'clustering/tasks/'
                    + task.taskId + '/visualization',
                }).then(function (resp, status) {
                $scope.dataOuputDivVisible = true;
                $scope.outputPanelState = "收起";
                $scope.meta = resp.data.meta;
                $scope.status = status;

                var dataPoints = resp.data.dataPoints;
                for (var i = 0; i < resp.data.dataPoints.length; i++){
                    dataPoints[i][0] = $scope.newTaskOutputLables[dataPoints[i][0]];
                }
                $scope.currentTaskOutputRawData = dataPoints;

                //分页总数
                $scope.pageSize = 20;
                $scope.pages = Math.ceil($scope.currentTaskOutputRawData.length / $scope.pageSize); //分页数
                $scope.newPages = $scope.pages > 15 ? 15 : $scope.pages;
                $scope.selPage = 1;
                $scope.pageList = [];
                //分页要repeat的数组
                for (var i = 0; i < $scope.newPages; i++) {
                    $scope.pageList.push(i + 1);
                }

                //设置表格数据源(分页)
                $scope.setData = function () {
                    $scope.items = $scope.currentTaskOutputRawData.slice(($scope.pageSize * ($scope.selPage - 1)), ($scope.selPage * $scope.pageSize));//通过当前页数筛选出表格当前显示数据
                }
                $scope.items = $scope.currentTaskOutputRawData.slice(0, $scope.pageSize);

                //打印当前选中页索引
                $scope.selectPage = function (page) {
                    //不能小于1大于最大
                    if (page < 1 || page > $scope.pages) return;
                    //最多显示分页数15
                    if (page > 7) {
                        //因为只显示15个页数，大于7页开始分页转换
                        var newpageList = [];
                        for (var i = (page - 8); i < ((page + 7) > $scope.pages ? $scope.pages : (page + 7)); i++) {
                            newpageList.push(i + 1);
                        }
                        $scope.pageList = newpageList;
                    }
                    else{
                        var newpageList = [];
                        for (var i = 0; i < $scope.newPages; i++) {
                            newpageList.push(i + 1);
                        }
                        $scope.pageList = newpageList;
                    }
                    $scope.selPage = page;
                    $scope.setData();
                    $scope.isActivePage(page);
                    console.log("选择的页：" + page);
                };
                //设置当前选中页样式
                $scope.isActivePage = function (page) {
                    return $scope.selPage == page;
                };
                //上一页
                $scope.Previous = function () {
                    $scope.selectPage($scope.selPage - 1);
                }
                //下一页
                $scope.Next = function () {
                    $scope.selectPage($scope.selPage + 1);
                };

            }, function (resp, status) {
                $scope.resp = resp;
                $scope.status = status;
            });
        }

    }

    /**
     * 数据可视化
     */
    $scope.getDataVisualization = function (task) {
        console
            .log("[VISUALIZATION] You are making visualization for the task whose id is "
                + task.taskId);
        if ($scope.taskChartDivVisible){
            $scope.taskChartDivVisible = false;
            $scope.visualizationState = "展开";
        }
        else{
            $http(
                {
                    method: 'GET',
                    url: 'clustering/tasks/'
                    + task.taskId + '/visualization',

                }).then(function (resp, status) {
                // 显示任务输出可视化控件
                $scope.taskChartDivVisible = true;
                $scope.visualizationState = "收起";
                $scope.status = status;

                $scope.data = new Object();
                $scope.data.meta = resp.data.meta;

                //把图例从id替换为标签
                var labels = new Array();
                for (var i = 0; i < resp.data.categories.length; i++ ){
                    labels.push($scope.newTaskOutputLables[resp.data.categories[i]]);
                }
                $scope.data.categories = labels;

                var dataPoints = resp.data.dataPoints;
                // make sure there are 4 columns
                if (dataPoints[0].length < 5){
                    var colNum = resp.data.dataPoints[0].length;
                    var num = 5 - colNum;
                    for (var i = 0; i < resp.data.dataPoints.length; i++){
                        for (var j = 0; j < num; j++){
                            dataPoints[i].push(0);
                        }
                        dataPoints[i][0] = $scope.newTaskOutputLables[dataPoints[i][0]];
                    }
                    for (var i = 0; i < num; i++){
                        resp.data.meta.push({"name": "null" + (colNum + i), "index": (colNum + i)})
                    }
                }
                //把替换datapoints中的clusterId替换为标签label
                else {
                    for (var i = 0; i < resp.data.dataPoints.length; i++){
                        dataPoints[i][0] = $scope.newTaskOutputLables[dataPoints[i][0]];
                    }
                }

                $scope.data.meta = resp.data.meta;
                $scope.data.dataPoints = dataPoints;

            }, function (resp, status) {
                $scope.status = status;
                $scope.resp = resp;
            });
        }

    };



    /**
     * 获取类别特征
     */
    $scope.getFeaturesData = function (task) {
        console
            .log("[VISUALIZATION] You are getting FeaturesData for the task whose id is "
                + task.taskId);
        if ($scope.dataFeaturesDivVisible){
            $scope.dataFeaturesDivVisible = false;
            $scope.featurePanelState = "展开";
        }
        else {
            $http(
                {
                    method: 'GET',
                    url: 'analysis/features/'
                    + task.taskId,
                }).then(function (resp, status) {
                $scope.dataFeaturesDivVisible = true;
                $scope.featurePanelState = "收起";
                $scope.status = status;

                $scope.featureMeta = resp.data.meta;
                $scope.thHtml = "";
                var colNum = $scope.featureMeta.length;
                for (var i = 0 ; i < colNum; i++){
                    $scope.thHtml += "<th>最小值</th><th>最大值</th><th>均值</th>";
                }

                $scope.featuresRawData = resp.data.data;
                var featuresRawData = resp.data.data;
                var featuresHtml = "";
                for (var item in featuresRawData){
                    featuresHtml += "<tr><td>" + $scope.newTaskOutputLables[item] + "</td>";
                    for (var col in featuresRawData[item]){
                        featuresHtml += "<td>" + featuresRawData[item][col]["min"] + "</td>" +
                            "<td>" + featuresRawData[item][col]["max"] + "</td>" +
                            "<td>" + featuresRawData[item][col]["avg"] + "</td>";
                    }
                    featuresHtml += "<tr>";
                }
                $scope.featuresHtml = featuresHtml;

            }, function (resp, status) {
                $scope.status = status;
                $scope.resp = resp;
            });
        }

    };


};

indexApp.controller('taskManagementCtrl', taskManagementFunc);

/* ****************************************** */
indexApp
    .directive(
        'echarts',
        function () {
            return {
                scope: {
                    id: "@",
                    legend: "=",
                    data: "="
                },
                restrict: 'E',
                template: '<div style="height: 600px;"></div>',
                replace: true,
                link: function ($scope, element, attrs, controller) {
                    $scope
                        .$watch(
                            'data',
                            function (newValue, oldValue, scope) {

                                var schema = $scope.data.meta;

                                var config = {
                                    xAxis3D: $scope.data.meta[1].name,
                                    yAxis3D: $scope.data.meta[2].name,
                                    zAxis3D: $scope.data.meta[3].name,
                                    color: $scope.data.meta[0].name,
                                    symbolSize: $scope.data.meta[4].name
                                };


                                var fieldIndices = schema
                                    .reduce(
                                        function (obj,
                                                  item) {
                                            obj[item.name] = item.index;
                                            return obj;
                                        }, {});

                                var getMaxOnExtent = function (data) {
                                    var symbolSizeMax = -Infinity;
                                    for (var i = 0; i < data.length; i++) {
                                        var item = data[i];
                                        var symbolSizeVal = item[fieldIndices[config.symbolSize]];
                                        symbolSizeMax = Math
                                            .max(
                                                symbolSizeVal,
                                                symbolSizeMax);
                                    }
                                    return {
                                        symbolSize: symbolSizeMax
                                    };
                                }

                                if ($scope.data != undefined) {
                                    var max = getMaxOnExtent($scope.data.dataPoints);
                                }
                                var groupCategories = [];
                                var groupColors = [];
                                var data;
                                var fieldNames = schema
                                    .map(function (item) {
                                        return item.name;
                                    });
                                fieldNames = fieldNames.slice(
                                    1, fieldNames.length);

                                var myChart = echarts
                                    .init(
                                        document
                                            .getElementById($scope.id),
                                        'macarons');

                                myChart
                                    .setOption({
                                        toolbox: {
                                            show: true,
                                            left: 'left',
                                            feature: {
                                                dataView: {
                                                    readOnly: true
                                                },
                                                restore: {},
                                                saveAsImage: {}
                                            }
                                        },
                                        tooltip: {
                                            formatter: function (params) {
                                                var result = "";
                                                // params.data[5]为当前数据在data中的索引
                                                var dataIndex = params.data[5];
                                                for (var i = 0; i < schema.length; i++) {
                                                    result += schema[i].name
                                                        + ": "
                                                        + $scope.data.dataPoints[dataIndex][i]
                                                        + "<br>";
                                                }
                                                return result;
                                            }
                                        },
                                        visualMap: [
                                            {
                                                dimension: config.color,
                                                categories: $scope.data.categories,
                                                inRange: {
                                                    color: [
                                                        '#1710c0',
                                                        '#0b9df0',
                                                        "#9F2E61",
                                                        '#00fea8',
                                                        "#2F9323",
                                                        "#D9B63A",
                                                        "#2E2AA4",
                                                        "#4D670C",
                                                        "#BF675F",
                                                        "#1F814A",
                                                        "#357F88",
                                                        "#673509",
                                                        "#310937",
                                                        "#1B9637",
                                                        "#F7393C"]
                                                },
                                                textStyle: {}
                                            },
                                            {
                                                bottom: 10,
                                                calculable: true,
                                                dimension: 4,
                                                show: false,
                                                max: max.symbolSize / 2,
                                                inRange: {
                                                    symbolSize: [
                                                        5,
                                                        15]
                                                },
                                                textStyle: {}
                                            }],
                                        xAxis3D: {
                                            name: config.xAxis3D,
                                            type: 'value'
                                        },
                                        yAxis3D: {
                                            name: config.yAxis3D,
                                            type: 'value'
                                        },
                                        zAxis3D: {
                                            name: config.zAxis3D,
                                            type: 'value'
                                        },
                                        grid3D: {
                                            axisLine: {
                                                lineStyle: {}
                                            },
                                            axisPointer: {
                                                lineStyle: {
                                                    color: '#ffbd67'
                                                }
                                            },
                                            viewControl: {}
                                        },
                                        series: [{
                                            type: 'scatter3D',
                                            dimensions: [
                                                config.xAxis3D,
                                                config.yAxis3D,
                                                config.zAxis3D,
                                                config.color,
                                                config.symbolSize],
                                            data: $scope.data.dataPoints
                                                .map(function (item,
                                                               idx) {

                                                    return [
                                                        item[fieldIndices[config.xAxis3D]],
                                                        item[fieldIndices[config.yAxis3D]],
                                                        item[fieldIndices[config.zAxis3D]],
                                                        item[fieldIndices[config.color]],
                                                        item[fieldIndices[config.symbolSize]],
                                                        idx];
                                                }),
                                            symbolSize: 12,
                                            itemStyle: {
                                                borderWidth: 1,
                                                borderColor: 'rgba(255,255,255,0.8)'
                                            },
                                            emphasis: {
                                                itemStyle: {}
                                            }
                                        }]
                                    });

                                myChart.resize();

                            });



                }
            };
        });




indexApp
    .directive(
        'featureChart',
        function () {
            return {
                scope: {
                    id: "@",
                    data: "=",
                    meta: "=",
                    label: "="
                },
                restrict: 'E',
                template: '<div style="height: 600px;"></div>',
                replace: true,
                link: function ($scope, element, attrs, controller) {
                    $scope
                        .$watch(
                            'data',
                            function (newValue, oldValue, scope) {

                                var index = $scope.id.substring(4);

                                var featuresRawData = $scope.data;
                                var label = $scope.label;
                                var categories = new Array();
                                var min = new Array();
                                var max = new Array();
                                var avg = new Array();
                                console.log(label);
                                for (var item in label){
                                    categories.push(label[item]);
                                    console.log(label[item]);
                                }

                                for (var item in featuresRawData){
                                    min.push(featuresRawData[item][index]["min"]);
                                    max.push(featuresRawData[item][index]["max"]);
                                    avg.push(featuresRawData[item][index]["avg"]);
                                }


                                var echartsWarp = document.getElementById($scope.id);
                                var resizeWorldMapContainer = function () {//用于使chart自适应高度和宽度,通过窗体高宽计算容器高宽
                                    echartsWarp.style.width = window.innerWidth*0.3+'px';
                                    echartsWarp.style.height = window.innerHeight*0.5+'px';
                                };

                                resizeWorldMapContainer ();//设置容器高宽


                                var myChart = echarts.init(echartsWarp);// 基于准备好的dom，初始化echarts实例

                                myChart.setOption({
                                    title: {
                                        text: $scope.meta[index].name,
                                        textStyle:{
                                            fontWeight: 'lighter'
                                        }
                                    },
                                    tooltip : {
                                        trigger: 'axis',
                                        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                                            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                                        },
                                        formatter: function (params) {
                                            var tar = params[1];
                                            return tar.name + '<br/>' + tar.seriesName + ' : ' + tar.value + "<br>" +
                                                params[0].seriesName + ' : ' +  params[0].value;
                                        }
                                    },
                                    grid: {
                                        left: '3%',
                                        right: '4%',
                                        bottom: '3%',
                                        containLabel: true
                                    },
                                    xAxis: {
                                        type : 'category',
                                        splitLine: {show:false},
                                        data : categories
                                    },
                                    yAxis: {
                                        type : 'value'
                                    },
                                    series: [
                                        {
                                            name: '最小值',
                                            type: 'bar',
                                            barMaxWidth: 20,
                                            stack:  '总量',
                                            itemStyle: {
                                                normal: {
                                                    barBorderColor: '#0000',
                                                    color: '#0000'
                                                },
                                                emphasis: {
                                                    barBorderColor: '#0000',
                                                    color: '#0000'
                                                }
                                            },
                                            data: min
                                        },

                                        {
                                            name: '最大值',
                                            type: 'bar',
                                            stack: '总量',
                                            itemStyle: {
                                                normal: {
                                                    barBorderColor: '#cd6a67',
                                                    color: '#cd6a67'
                                                },
                                                emphasis: {
                                                    barBorderColor: '#cd6a67',
                                                    color: '#cd6a67'
                                                }
                                            },
                                            data: max
                                        },
                                        {
                                            name: '均值',
                                            type: 'line',
                                            label: {
                                                normal: {
                                                    show: true,
                                                    position: 'top',
                                                    color: "#292929"
                                                }
                                            },
                                            itemStyle: {
                                                color: '#39546b'
                                            },
                                            data: avg
                                        }
                                    ]
                                    });

                                myChart.resize();

                            });
                }
            };
        });





indexApp.filter('trustHtml', function ($sce) {
    return function (input) {
        return $sce.trustAsHtml(input);
    }
});