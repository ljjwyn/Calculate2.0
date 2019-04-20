package com.calculate.demo.service;

import com.calculate.demo.entity.TaskDetail;
import com.calculate.demo.mapper.taskCalculateMapper;
import com.singularsys.jep.JepException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.sound.midi.SysexMessage;
import java.io.IOException;
import java.util.*;

@Service
public class AsyncService {
    private static final Logger logger = LoggerFactory.getLogger(AsyncService.class);

    @Autowired
    taskCalculateMapper taskCalculateMapper;

    @Async
    public void async(Map<String, Object> config, TaskDetail taskDetail) throws JepException, IOException {
        logger.info("start executeAsync");
        long startTime=System.nanoTime();
        CalculateTool calculateTool=new CalculateTool();
        calculateTool.config(config,taskDetail);
        calculateTool.calculateAll();
        logger.info("end executeAsync");
        long endTime=System.nanoTime(); //获取结束时间
        System.out.println("async异步程序运行时间： "+(endTime-startTime)+"ns");
    }



    public  TaskDetail config(Map<String, Object> config,String uuid) {
        long startTime = System.nanoTime();
        TaskDetail taskDetail=new TaskDetail();
        taskDetail.setTaskId(uuid);
        taskDetail.setTaskProcessRate(0.00);
        System.out.println(config);
        Iterator<Map.Entry<String, Object>> entries = config.entrySet().iterator();
        while (entries.hasNext()) {
            Map.Entry<String, Object> entry = entries.next();
            if (entry.getKey().equals("tableName")) {
                taskDetail.setTableName((String)entry.getValue());
            } else if (entry.getKey().equals("taskName")) {
                taskDetail.setTaskName((String)entry.getValue());
            } else if (entry.getKey().equals("taskDescription")) {
                taskDetail.setTaskDescription((String) entry.getValue());
            } else if (entry.getKey().equals("dbName")) {
                taskDetail.setDatabaseName((String) entry.getValue());
            } else if (entry.getKey().equals("formula")) {
                String formulas_str=entry.getValue().toString();
                taskDetail.setFormulas(formulas_str);
                System.out.println("formulas"+formulas_str);
                System.out.println("taskfor放入"+taskDetail.getFormulas());
            } else if (entry.getKey().equals("rules")) {
                ArrayList<String> rules = new ArrayList<>();
//                //Map<String, String> rule = (Map<String, String>) entry.getValue();
//                for (Map.Entry<String, String> r_entry : rule.entrySet()) {
//                    String rule_str = r_entry.getKey() + ":" + r_entry.getValue();
//                    rules.add(rule_str);
//                }
                String rules_str=entry.getValue().toString();
                taskDetail.setRules(rules_str);
                System.out.println("taskrule放入"+taskDetail.getRules());
            }




        }
        taskDetail.setTimeCreate(new Date());
        long endTime = System.nanoTime(); //获取结束时间
        System.out.println("config程序运行时间： " + (endTime - startTime) / 1000000 + "ns");
        return taskDetail;
    }
}