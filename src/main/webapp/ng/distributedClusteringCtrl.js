/**
 * NG控制器 distributedClusteringCtrl.js 2018-07-26 15:19
 * 
 * @author Wang Xiaodong
 */
indexApp
		.controller(
				'distributedClusteringCtrl',
				function($scope, $http, $timeout) {

                    /**
					 * 数据库信息
                     */
                    $scope.dbInfoList = ["人口库","法人库","证照库","车辆库"];
					$scope.dbNameList = ["jck_basic_db","fupindb","fupindb","fupindb"];

                    $scope.selectedDatabaseIndex = 0;
                    $scope.selectedDatabase = $scope.dbNameList[0];
                    $scope.primaryKey = 'id';
                    $scope.tableMeta = {};

					/**
					 * 任务配置对象
					 */
					$scope.taskConfig = {
						taskId : null,
						taskName : "任务名",
						description : "创建贫困户数据分组画像任务。",
						creator : "lijiajie",
						createTime : null,
						finishTime : null,
						dbName : null,
						tableName : null,
						formula : null,
						rules : null,
						taskTableName : null,
						taskGlobalTableName : null,
						taskProgressRate: null
					};


					/**
					 * 创建新任务
					 */
					$scope.apiCreateTask = 'clustering/tasks';
					$scope.flagTag = 0;
					var rulaFlag = 0;
					var formulaFlag = 0;
					var sym = "";
					$scope.packageJsonAdd = function() {
                    	$scope.add = "+";
                    	sym = $scope.symbol = "+";
                    	$scope.formula1 = $scope.formula1
									+ sym ;
                    	console.log(sym);

                    }
                    $scope.packageJsonsub = function() {
                    	$scope.sub = "-";
                    	sym = $scope.symbol = "-";
                    	$scope.formula1 = $scope.formula1
									+ sym ;
                    	console.log(sym);

                    }
                    $scope.packageJsonmul = function() {
                    	$scope.mul = "*";
                    	sym = $scope.symbol = "*";
                    	$scope.formula1 = $scope.formula1
									+ sym ;
                    	console.log(sym);

                    }
                    $scope.packageJsondiv = function() {
                    	$scope.div = "/";
                    	sym = $scope.symbol = "/";
                    	$scope.formula1 = $scope.formula1
									+ sym ;
                    	console.log(sym);

                    }
                    $scope.packageJsoninv = function() {
                    	$scope.inv = "^";
                    	sym = $scope.symbol = "^";
                    	$scope.formula1 = $scope.formula1
									+ sym ;
                    	console.log(sym);

                    }
                    $scope.packageJsonLpar = function() {
                    	$scope.Lpar = "(";
                    	sym = $scope.symbol = "(";
                    	if (rulaFlag == 0){
                    		$scope.formula1 = $scope.formula1
									+ sym ;
                    	}else{
                    		$scope.rula = $scope.rula
									+ sym ;
                    	}
          
                    	console.log(sym);

                    }
                    $scope.packageJsonRpar = function() {
                    	$scope.Rpar = ")";
                    	sym = $scope.symbol = ")";
                    	if (rulaFlag == 0){
                    		$scope.formula1 = $scope.formula1
									+ sym ;
                    	}else{
                    		$scope.rula = $scope.rula
									+ sym ;
                    	}
                    	console.log(sym);

                    }
                    $scope.packageJsongre = function() {
                    	$scope.Rpar = ">";
                    	sym = $scope.symbol = ">";
                    	$scope.rula = $scope.rula
									+ sym ;
                    	console.log(sym);

                    }
                    $scope.packageJsonles = function() {
                    	$scope.Rpar = "<";
                    	sym = $scope.symbol = "<";
                    	$scope.rula = $scope.rula
									+ sym ;
                    	console.log(sym);

                    }
                    $scope.packageJsonequ = function() {
                    	$scope.Rpar = "=";
                    	sym = $scope.symbol = "=";
                    	$scope.rula = $scope.rula
									+ sym ;
                    	console.log(sym);

                    }
                    $scope.packageJsonGE = function() {
                    	$scope.Rpar = ">=";
                    	sym = $scope.symbol = ">=";
                    	$scope.rula = $scope.rula
									+ sym ;
                    	console.log(sym);

                    }
                    $scope.packageJsonLE = function() {
                    	$scope.Rpar = "<=";
                    	sym = $scope.symbol = "<=";
                    	$scope.rula = $scope.rula
									+ sym ;
                    	console.log(sym);

                    }
                    $scope.packageJsonNE = function() {
                    	$scope.Rpar = "!=";
                    	sym = $scope.symbol = "!=";
                    	$scope.rula = $scope.rula
									+ sym ;
                    	console.log(sym);

                    }
                    $scope.packageJsonAND = function() {
                    	$scope.Rpar = "&&";
                    	sym = $scope.symbol = "&&";
                    	$scope.rula = $scope.rula
									+ sym ;
                    	console.log(sym);

                    }
                    $scope.packageJsonOR = function() {
                    	$scope.Rpar = "||";
                    	sym = $scope.symbol = "||";
                    	$scope.rula = $scope.rula
									+ sym ;
                    	console.log(sym);

                    }
                    $scope.packageJsonThen = function() {
                    	$scope.Rpar = ":";
                    	sym = $scope.symbol = ":";
                    	$scope.rula = $scope.rula
									+ sym ;
                    	console.log(sym);
                    }
                    $scope.packageJsonEnt = function() {
                    	if (rulaFlag==1){
                    		$scope.rula = $scope.rula
									+ "\n" ;
                    	}
                    	else{
                    		$scope.formula1 = $scope.formula1
									+ "\n";
                    	}
                    	
                    }
                    $scope.rula = ""
                    $scope.rulaInput = function() {
                    	rulaFlag = 1;
                    	formulaFlag = 0;

                    }

                    $scope.formulaInput = function() {
                    	rulaFlag = 0;
                    	formulaFlag = 1;
                    }
                    $scope.formula1 = "var = ";

                    $scope.submitJson = function() {
                    	$scope.taskConfig["formula"] = $scope.formula1;
                    	$scope.taskConfig["rules"] = $scope.rula;
                    	$scope.taskConfig["tableName"] = $scope.currentMySQLTable;
                    	$scope.taskConfig["dbName"] = "jck_basic_db";
                    	$scope.taskToken01 = true;
                    	$scope.taskToken02 = true;
                    	$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : '/cal/config',
							data : $scope.taskConfig,

						}).then(function(resp, status) {
							$scope.result = resp.data["result"];
							console.log(resp.data);
							$scope.status = status;

						}, function(resp, status) {
							$scope.resp = resp;
							$scope.status = status;
						});
                    }

					$scope.createTask = function() {
						// 重置Token
						$scope.taskToken01 = false;
						$scope.taskToken02 = false;
                        $scope.taskConfig.portraitSubject = $scope.dbInfoList[$scope.selectedDatabaseIndex];
                        //$scope.dataPrimaryKey = $scope.primaryKey;
                        $scope.taskConfig.dataPrimaryKeyName = $scope.primaryKey;

						$scope.taskConfig.dataTableName = $scope.currentMySQLTable;

						$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : $scope.apiCreateTask,
							data : $scope.taskConfig,

						}).then(function(resp, status) {
							$scope.taskConfig.taskId = resp.data;
							console.log(resp.data);
							$scope.status = status;

						}, function(resp, status) {
							$scope.resp = resp;
							$scope.status = status;
						});
					};

					/**
					 * 生成Token以满足任务创建条件（要求数据集配置和参数配置全部完成后才能点击创建任务按钮）
					 */
					$scope.saveDatasetPath = function() {
						$scope.taskToken01 = true;
					};

					$scope.saveAlgParam = function() {
						$scope.taskToken02 = true;
					};

					/**
					 * 界面视图组件可见性设置
					 */
					$scope.mysqlDbInfoVisible = false;
					$scope.mysqlDbTableInfoVisible = false;
					$scope.sqlUserDefinedTableDataVisible = false;
					$scope.progressBarVisible = false;

					/**
					 * MySQL数据源配置对象
					 */
                    var mysqlConfig = $scope.mysqlConfig = {
                        ip : "127.0.0.1",
                        port : "3306",
                        dbName : $scope.selectedDatabase,
                        username : "root",
                        password : "root"
                    };



					/**
					 * 连接MySQL数据库
					 */
					$scope.connectMySQL = function() {
						$scope.mysqlDbTableInfoVisible = false;
                        $scope.mysqlConfig.dbName =
                            $scope.selectedDatabase =
                                $scope.dbNameList[parseInt($scope.selectedDatabaseIndex)];

						var apiMySQLConnect = '/MySQLManager/mysql/connect';
						$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : apiMySQLConnect,
							data : $scope.mysqlConfig,

						}).then(function(resp, status) {
							console.log(resp);
							$scope.logForConnection = resp.data["message"];
						}, function(resp, status) {
							$scope.resp = resp;
							$scope.status = status;
						});
					}

					/**
					 * 关闭数据库连接（仅仅隐藏相关可视组件）
					 */
					$scope.disconnectMySQL = function() {
						$scope.mysqlDbInfoVisible = false;
						$scope.mysqlDbTableInfoVisible = false;
					}


                    function objKeySort(arys) {
                        var newkey = Object.keys(arys).sort();　　 //
                        var newObj = {};
                        for(var i = 0; i < newkey.length; i++) {
                            newObj[newkey[i]] = arys[newkey[i]];
                        }
                        return newObj;
                    }

					/**
					 * 查询MySQL数据库中所有表
					 */
					var listMySQLTables = $scope.listMySQLTables = function() {
						$scope.mysqlDbInfoVisible = true;
						$scope.selected = [];
						var selectedTags = $scope.selectedTags = [];
						$scope.selectedTagsString = undefined;
						$scope.sqlStatement = undefined;

						var apiMySQLTables = '/MySQLManager/mysql/tables';

						$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : apiMySQLTables,
							data : mysqlConfig,
						}).then(function(resp, status) {
							console.log(resp);
							$scope.mysqlTables = resp.data["data"];

                            mysqlConfig.tables = resp.data["data"];
                            $http({
                                method : 'POST',
                                headers : {
                                    'Content-Type' : 'application/json',
                                },
                                url: '/MySQLManager/mysql/tables/comments',
                                data: mysqlConfig,
                            }).then(function(resp, status) {
                                var a = $scope.tableMeta = Object.assign({}, $scope.tableMeta, resp.data["data"]);
                                $scope.tableMeta = objKeySort(a);
                                console.log(resp);
                                showTableInfo(resp.data["data"][0]);
                            }, function(resp, status) {
                                $scope.resp = resp;
                                $scope.status = status;
                            })


						}, function(resp, status) {
							$scope.resp = resp;
							$scope.status = status;
						});
					}



					$scope.currentMySQLTable = undefined;
					$scope.currentMySQLTableDesc = undefined;

                    /**
                     * 显示表相关信息
                     */
					var showTableInfo = $scope.showTableInfo = function (tableName) {
                        /**
                         * 获取表的列头信息
                         */
                        $http({
                            method : 'POST',
                            headers : {
                                'Content-Type' : 'application/json',
                            },
                            url : '/MySQLManager/mysql/tables/' + tableName + "/comments",
                            data : mysqlConfig,
                        }).then(function(resp, status) {
                            console.log(resp);
                            $scope.currentMySQLTableColumnName = resp.data["data"];
                            var count = 0;
                            var a = $scope.currentMySQLTableColumnName;
                            for (var item in a) {
                                if (count == 0) {
                                    $scope.primaryKey = item;
                                    count++;
                                }
                                if (a[item] == "" || a[item] == null) {
                                    delete a[item];
                                }
                            }

                            $scope.currentMySQLTableColumnName = a;

                            /**
                             * 显示表样例、表结构等信息
                             */
                            getMySQLTableDesc(tableName);
                            getMySQLTableSampleData(tableName);


                        }, function(resp, status) {
                            $scope.resp = resp;
                            $scope.status = status;
                        });
                    };



					/**
					 * 查询MySQL数据库中某表的结构
					 */
					var getMySQLTableDesc = $scope.getMySQLTableDesc = function(
							tableName) {
						$scope.currentMySQLTable = tableName;
						$scope.selected = [];
						var selectedTags = $scope.selectedTags = [];
						$scope.selectedTagsString = undefined;
						$scope.sqlStatement = undefined;
						$scope.sqlUserDefinedTableDataVisible = false;
						$scope.sqlStatement = "SELECT * FROM " + tableName;
						

						var apiMySQLTableDesc = '/MySQLManager/mysql/tables/'
								+ tableName;

						$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : apiMySQLTableDesc,
							data : mysqlConfig,
						}).then(function(resp, status) {
							console.log(resp);
                            $scope.mysqlDbTableInfoVisible = true;
							$scope.mysqlTableDesc = resp.data["data"];
							$scope.currentMySQLTableDesc = resp.data["data"];
						}, function(resp, status) {
							$scope.resp = resp;
							$scope.status = status;
						});
					}

					/**
					 * 查询MySQL数据库中某表查询样例（接口只返回5行样例数据）
					 */
					var getMySQLTableSampleData = $scope.getMySQLTableSampleData = function(
							tableName) {

						var apiMySQLTableSampleData = '/MySQLManager/mysql/select';

						mysqlConfig["sql"] = "SELECT * FROM " + tableName;

						$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : apiMySQLTableSampleData,
							data : mysqlConfig,
						}).then(function(resp, status) {
							console.log(resp);
							$scope.mysqlTableSampleData = resp.data["data"];
						}, function(resp, status) {
							$scope.resp = resp;
							$scope.status = status;
						});
					}

					/**
					 * 处理字段复选框
					 */
					$scope.selected = [];
					var selectedTags = $scope.selectedTags = [];
					$scope.selectedTagsString = undefined;
                    $scope.selectedMeta = [];
                    $scope.sqlsubject = [];
                    
					var updateSelected = function(action, id, name) {
						$scope.sqlUserDefinedTableDataVisible = false;
						$scope.progressBarValue = 0;
						$scope.flagTag = 1;
						if (action == 'add'
								&& $scope.selected.indexOf(id) == -1) {
							$scope.selected.push(id);
							$scope.selectedTags.push(name);
						}

						if (action == 'remove'
								&& $scope.selected.indexOf(id) != -1) {
							var idx = $scope.selected.indexOf(id);
							$scope.selected.splice(idx, 1);
							$scope.selectedTags.splice(idx, 1);
							
						}
						

						if ($scope.selected.length > 0) {
							$scope.selectedTagsString = $scope.selected.join(', ');
                            mysqlConfig["meta"] = $scope.selectedMeta = $scope.selected.map(function (item) {
                                return $scope.currentMySQLTableColumnName[item] ;
                            });
                            /*
							$scope.selectedTagsString = $scope.selected.reduce(function (p, current) {
                                var comma = ", ";
                                var label = " ";
                                if (p == "") {
                                    comma = " ";
                                }
                                if ($scope.currentMySQLTableColumnName[current] != ""
                                    && $scope.currentMySQLTableColumnName[current] != null ) {
                                    label = " as '" + $scope.currentMySQLTableColumnName[current] +"' ";
                                }
                                return p + comma + current + label;

                            }, "");
                            if ($scope.flagTag == 0){
								$scope.formula1 = $scope.formula1
									+ sym ;
							}
						else{
								$scope.formula1 = $scope.formula1
									+ $scope.selectedTagsString;
							}
                            */
                            mysqlConfig["sql"] = $scope.sqlStatement = "SELECT "
									+ $scope.selectedTagsString + " FROM "
									+ $scope.currentMySQLTable;

						} else {
						    var a = $scope.primaryKey;
                            $scope.selectedMeta = [a];

                            var colStr = "";
                            for (var item in $scope.currentMySQLTableColumnName) {
                                colStr += item + ", ";
                                $scope.selectedMeta.push($scope.currentMySQLTableColumnName[item]);
                            }
                            mysqlConfig["meta"] = $scope.selectedMeta;


                            mysqlConfig["sql"] = $scope.sqlStatement
                                = "SELECT " + colStr.substring(0, colStr.length - 2) + " FROM " + $scope.currentMySQLTable;
                            if(action == 'addPrimaryKey') {
                                colStr = $scope.primaryKey + ", " + colStr;
                                mysqlConfig["sql"] = "SELECT " + colStr.substring(0, colStr.length - 2) + " FROM " + $scope.currentMySQLTable;
                            }
						}
					}

					$scope.deleteItem = function(item){
						for (var i = 0; i < $scope.sqlsubject.length; i++) {
                			if ($scope.sqlsubject[i] == item) {
                    			$scope.sqlsubject.splice(i, 1);
                			}

            			}

						console.log("tset:"+$scope.sqlsubject);
					}
					var updateSelect = function(flags, id, type) {
						if(flags=='add'){
							var subject = id + " FROM "
									+ $scope.currentMySQLTable;
							$scope.sqlsubject.push(subject);
							console.log($scope.sqlsubject);
						}
						else{
							$scope.sqlsubject.pop();
							console.log($scope.sqlsubject);
						}

					}
					$scope.updateSubject = function(flags, id, type) {
						if (rulaFlag == 0){
							if (flags == '1'){
								$scope.formula1 = $scope.formula1
										+ id;
							}
							else{
								$scope.formula1 = $scope.formula1.replace(id,'');
							}
						}else{
							if (flags == '1'){
								$scope.rula = $scope.rula
										+ id;
							}
							else{
								$scope.rula = $scope.rula.replace(id,'');
							}
						}
					}

					$scope.updateSelection = function($event, id, type) {

                        console.log("event", $event);
                        if (type == 'primaryKey'){
                        }
                        else if (type == "selected"){
                            var checkbox = $event.target;
                            var action = (checkbox.checked ? 'add' : 'remove');
                            updateSelected(action, id, checkbox.name);
                            updateSelect(action, id, checkbox.name);
                        }

					}

					$scope.isSelected = function(id) {
						return $scope.selected.indexOf(id) >= 0;
					}
/*					$scope.initPrimaryKey = function (a) {
                        $scope.primaryKey = a;
                    }
*/                   $scope.isPrimaryKey = function(v) {
					    var pk = $scope.primaryKey;
					    if (pk == v) {
					        return 'checked';
                        }
                        else {
					        return 'false';
                        }
                    }
                    /**
					 * 封装公式和规则
					 */
                    


					/**
					 * 基于自定义SQL查询MySQL数据库中某表查询样例（接口只返回5行样例数据）
					 */
					$scope.getMySQLTableSampleDataBySQL = function() {
						var apiMySQLTableSampleData = '/MySQLManager/mysql/select';
                        updateSelected(null, null, null);
                        $scope.sqlUserDefinedTableDataVisible = true;

						$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : apiMySQLTableSampleData,
							data : mysqlConfig,
						})
								.then(
										function(resp, status) {
											console.log(resp);
											$scope.mysqlTableSampleDataBySQL = resp.data["data"];
										}, function(resp, status) {
											$scope.resp = resp;
											$scope.status = status;
										});
					}

					/**
					 * 设置数据导出进度条初始值
					 */
					$scope.progressBarValue = 0;

					/**
					 * 导出MySQL数据到HDFS（用Sqoop）
					 */
					$scope.btnExportDataToHDFSDisable = false;

					var exportMySQLTableDataToHDFS = $scope.exportMySQLTableDataToHDFS = function() {

						$scope.btnExportDataToHDFSDisable = true;
						$timeout(function() {
							$scope.btnExportDataToHDFSDisable = false;
						}, 5000);

						$scope.progressBarVisible = true;
						var apiMySQLTableSampleData = '/MySQLManager/mysql/mysql2hdfs';

                        var sql = $scope.sqlStatement;

                        mysqlConfig["sql"] = "SELECT " + $scope.primaryKey + ", " + sql.substring(6, sql.length);

                        var timestamp = new Date().getTime();

						// 用时间戳构造数据集存储目录
						var datasetPath = mysqlConfig["outputDirectory"] = "/user/hadoop/sqoop-job/dataset-"
								+ timestamp;

						$scope.taskConfig.datasetPath = "hdfs://master:9000" + datasetPath;

						$scope.mysqlConfig.meta = $scope.selectedMeta;

                        $http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : apiMySQLTableSampleData,
							data : mysqlConfig,
						})
                        .then(
                                function(resp, status) {
                                    console.log(resp.data);
                                    $scope.taskConfig.datasetPath = "hdfs://master:9000" + datasetPath;

                                }, function(resp, status) {
                                    $scope.resp = resp;
                                    $scope.status = status;
                                });
					}


					$scope.getOutputProgress = function (datasetPath) {
                        $http({
                            method : 'POST',
                            headers : {
                                'Content-Type' : 'application/json',
                            },
                            url : '/MySQLManager/mysql/mysql2hdfs/progress',
                            data : {"outputDirectory": $scope.taskConfig.datasetPath},
                        }).then(function(resp, status){

                            if (resp.data.progress == "导出成功"){
                                $scope.progressBarValue = 100;
                                $scope.progressStatus = "完成";
                            }
                            else {
                                if (resp.data.progress.indexOf("%")!=-1 ){
                                    var progress = resp.data.progress.substring(0, resp.data.progress.length-1);
                                    $scope.progressBarValue = parseFloat(progress);
                                }
                                $scope.progressBarValue = 10;
                                $scope.progressStatus = resp.data.progress;
                            }
                        },function(resp, status) {
                            $scope.resp = resp;
                            $scope.status = status;
                        })

                    }


				});
