package com.calculate.demo.controller;

import com.calculate.demo.service.CalculateTool;
import com.calculate.demo.entity.TaskDetail;
import com.calculate.demo.mapper.taskCalculateMapper;
import com.calculate.demo.mapper.taskDetailMapper;
import com.calculate.demo.service.AsyncService;
import com.singularsys.jep.JepException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/cal")
public class CalculateController {

    private static final Logger log = LoggerFactory.getLogger(CalculateController.class);
    @Autowired
    private taskDetailMapper taskDetailMapper;
    @Autowired
    private CalculateTool calculateTool;
    @Autowired
    private AsyncService asyncService;
    @Autowired
    private taskCalculateMapper taskCalculateMapper;



    @GetMapping("/test")
    public List<Map> test(String databaseName, String tableName) throws IOException {
        log.info("测试方法");
        databaseName="jck_basic_db";
        tableName="table1";
      return calculateTool.origin_set(databaseName,tableName);
    }

    @PostMapping("/config")
    public Map<String, String> config(@RequestBody Map<String, Object> config) throws JepException, IOException {
        long startTime=System.nanoTime();
        String uuid = UUID.randomUUID().toString().replaceAll("-","");
        TaskDetail taskDetail=asyncService.config(config, uuid);
        taskDetailMapper.insertAndReturnId(taskDetail);
        int result=taskDetail.getId();
        taskDetail.setTaskTableName("taskTable"+result);
        taskDetail.setTaskGlobalTableName("taskGlobalTable"+result);
        taskDetailMapper.updateTableName(taskDetail);
        asyncService.async(config, taskDetail);
        Map<String, String> returnObj = new HashMap<>();
        returnObj.put("taskId", uuid);
        long endTime=System.nanoTime(); //获取结束时间
        System.out.println("主程序运行时间： "+(endTime-startTime)/1000000+"s");
        return returnObj;

    }

    @GetMapping("/findById")
    public TaskDetail findById(String taskId) {
        TaskDetail result=taskDetailMapper.findByTaskId(taskId);
        return result;
    }


    @GetMapping("/findAll")
    public List<TaskDetail> findAll(){
        List<TaskDetail> result=taskDetailMapper.findAll();
        return result;
    }

    @GetMapping("/findProcess")
    public Double getProcess(String taskId){
        Double process=taskDetailMapper.findProcess(taskId);
        return process;
    }
}
