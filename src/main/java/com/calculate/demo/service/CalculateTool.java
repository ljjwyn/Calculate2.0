package com.calculate.demo.service;

import com.calculate.demo.entity.TaskDetail;
import com.calculate.demo.mapper.taskCalculateMapper;
import com.calculate.demo.mapper.taskDetailMapper;
import com.singularsys.jep.Jep;
import com.singularsys.jep.JepException;
import com.singularsys.jep.ParseException;
import com.singularsys.jep.functions.Str;
import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.Date;

@Component
public class CalculateTool {
    TaskDetail taskDetail;

    @Autowired
    taskDetailMapper taskDetailMapper;

    @Autowired
    taskCalculateMapper taskCalculateMapper;

    public static CalculateTool calculateTool;
    @PostConstruct
    public void init() {
        calculateTool=this;
    }

    int id;
    String taskId="";
    String taskName="";
    String taskDescription="";
    String PRI_Name="";
    String PRI_Type="";
    Date timeCreate;
    Date timeCompleted;
    String databaseName="";
    String tableName="";
    String taskTableName="";
    String taskGlobalTableName="";
    Double taskProcessRate;
    int sum;
    boolean first_global=true;
    Map<String, Object> tableMap = new HashMap<>();
    Map<String, Object> tableGlobalMap = new HashMap<>();
    Set<String> originset = new HashSet<String>();
    Set<String> tag_set=new HashSet<>();
    Map<String, Double> originMap = new HashMap<>();
    ArrayList<String> formulas = new ArrayList<>();
    Map<String, String> conditions = new HashMap<>();
    private static final Logger logger = LoggerFactory.getLogger(CalculateTool.class);






    public void calculateAll() throws IOException {
        long startTime=System.nanoTime();
        Map name=new HashMap();
        name.put("taskName",tableName );
        String resource = "mybatis/mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        Properties properties = new Properties();
        properties.setProperty("jdbc.driver", "com.mysql.cj.jdbc.Driver");
        properties.setProperty(
                "jdbc.url",
                "jdbc:mysql://localhost:3306/"+databaseName+"?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true");
        properties.setProperty("jdbc.username", "root");
        properties.setProperty("jdbc.password", "root");
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream,properties);
        SqlSession session = sqlSessionFactory.openSession();
        try {
            session.select("com.calculate.demo.mapper.taskCalculateMapper.selectAll",tableName,new ResultHandler() {
                        Double count=0.00;
                        public void handleResult(ResultContext resultContext) {
                            Map<String,Object> map=(Map<String,Object>)resultContext.getResultObject();

                            for (Map.Entry<String,Object> entry : map.entrySet()) {
                                if(originMap.keySet().contains(entry.getKey())){
                                    if(!entry.getValue().toString().isEmpty()){
                                        originMap.put(entry.getKey(),Double.parseDouble(entry.getValue().toString()));
                                    }else {
                                        originMap.put(entry.getKey(),0.00);
                                    }

                                }
                            }
                            try {
                                calculateOne();
                                judge();
                                count=count+1.00;
                                taskProcessRate=count/sum;
                                if(count%10==0){
                                    calculateTool.taskDetailMapper.save_process(taskProcessRate,taskId);
                                }else if(count==sum){
                                    calculateTool.taskDetailMapper.save_process(taskProcessRate,taskId);
                                    Date date=new Date();
                                    calculateTool.taskDetailMapper.completeTime(date,taskId);
                                }
                            } catch (JepException | IOException e) {
                                e.printStackTrace();
                            }

                        }
                    }
            );

        } finally {
            session.close();
        }


        long endTime=System.nanoTime(); //获取结束时间
        System.out.println("CalculateAll程序运行时间： "+(endTime-startTime)/1000000+"ns");

    }


    /**
     * 规则判断
     * @throws JepException
     */
    public  void judge() throws JepException {
        //对规则中每条变量注入值并判断
        long startTime=System.nanoTime();
        for(String s:conditions.keySet()){
            String flag_str=s;
            boolean flag=setFlag(flag_str);
            if(flag){
                //判断成功，则添加标签
                String os=conditions.get(s);
                if(os.contains(",")){
                    String[] nameStrArray=os.split(",");
                    for(int i=0;i<nameStrArray.length;i++){
                        String tag_str=nameStrArray[i];
                        String[] tag_list=tag_str.split("=");
                        String tag_name = tag_list[0];
                        String tag_value = tag_list[1];
                        calculateTool.taskCalculateMapper.updateTag(taskTableName,PRI_Name,(originMap.get(PRI_Name)).intValue(),tag_name,tag_value);
                    }
                }
                else {
                    String[] tag_list=os.split("=");
                    String tag_name = tag_list[0];
                    String tag_value = tag_list[1];
                    calculateTool.taskCalculateMapper.updateTag(taskTableName,PRI_Name,(originMap.get(PRI_Name)).intValue(),tag_name,tag_value);
                }



            }
        }
        long endTime=System.nanoTime(); //获取结束时间
        System.out.println("judge程序运行时间： "+(endTime-startTime)/1000000+"ns");
    }



    public  boolean setFlag(String flag_str) throws JepException {
        long startTime=System.nanoTime();
        Jep jep = new Jep(); //一个数学表达式
        jep.setAllowUndeclared(true);
        String r=analysis(flag_str);
        String[] fva=r.split(", ");
        jep.parse(flag_str);
        for (int j = 0; j < fva.length; j++) {
            boolean find = false;
            for (String s : originMap.keySet()) {
                if (fva[j].equals(s)) {
                    Double value=originMap.get(s);
                    jep.addVariable(s, value);
                    //System.out.println("jep放了"+value);
                    find = true;
                    break;
                }
            }
            if (!find) {
                for (String s : tableMap.keySet()) {
                    if (fva[j].equals(s)) {
                        Double value=(Double)tableMap.get(s);
                        jep.addVariable(s, value);
                        //System.out.println("jeptable放了"+value);
                        find = true;
                        break;
                    }
                }
            }
            if (!find) {
                for (String s : tableGlobalMap.keySet()) {
                    if (fva[j].equals(s)) {
                        jep.addVariable(s, tableGlobalMap.get(s));
                        //System.out.println("jep放了"+tableGlobalMap.get(s));
                        break;
                    }
                }
            }
        }
        boolean flag=(Boolean) jep.evaluate();
        long endTime=System.nanoTime(); //获取结束时间
        System.out.println("setFlag运行时间： "+(endTime-startTime)/1000000+"ns");
        return flag;
    }

    public  void calculateOne() throws JepException, IOException {
        System.out.println("单条记录开始计算");
        long startTime=System.nanoTime();
        //对记录逐一运用公式
        for (int i = 0; i < formulas.size(); i++) {
            String input = formulas.get(i);
            String[] nameStrArray = input.split("=");
            String p = nameStrArray[0];
            String formula = nameStrArray[1];
            Jep jep = new Jep(); //一个数学表达式
            jep.setAllowUndeclared(true);
            jep.getVariableTable().remove("e");
            jep.getVariableTable().remove("true");
            jep.getVariableTable().remove("false");
            jep.getVariableTable().remove("pi");
            jep.getVariableTable().remove("i");
            jep.parse(formula);
            //System.out.println("公式为"+formula);
            boolean isGlobal=isGlobal(formula);
            //判断是否是全局变量
            if (isGlobal) {
                if ((Double) tableGlobalMap.get(p) != 0.00) {
                    //全局变量已经计算，跳过
                } else {
                    //全局变量计算一次
                    System.out.println("全局变量"+p+"计算了一次");
                    if(formula.contains("MAX")||formula.contains("MIN")||formula.contains("SUM")||formula.contains("AVG")||formula.contains("COUNT")){
                        Double global_variable=cal_variable(formula);
                        //System.out.println("全局变量"+p+":"+global_variable);
                        tableGlobalMap.put(p, global_variable);
                    }else {
                        String re_ana=analysis(formula);
                        String[] vaArray=re_ana.split(", ");
                        for (int j = 0; j < vaArray.length; j++) {
                            for (String s : tableGlobalMap.keySet()) {
                                if (vaArray[j].equals(s)) {
                                    jep.addVariable(s, tableGlobalMap.get(s));
                                    //System.out.println("jep放了"+s+":"+tableGlobalMap.get(s));
                                }
                            }
                        }
                        Double result = (Double) jep.evaluate();
                        tableGlobalMap.put(p, result);
                    }
                }

            } else {
                try {
                    String v = jep.getVariableTable().keySet().toString();
                    String v2 = v.substring(1, v.length() - 1);
                    String[] vaArray = v2.split(", ");
                    for (int j = 0; j < vaArray.length; j++) {
                        String s=vaArray[j];
                        if(inorigin(s)){
                            jep.addVariable(s, originMap.get(s));

                        }
                        else if (insingle(s)){
                            jep.addVariable(s, tableMap.get(s));

                        }
                        else if(inquan(s)){
                            jep.addVariable(s, (Double) tableGlobalMap.get(s));

                        }
                    }
                    Double result = (Double) jep.evaluate();
                    tableMap.put(p, result);

                } catch (JepException e) {
                    e.printStackTrace();
                }
            }
        }
        //把中间变量持久化
        long endTime=System.nanoTime(); //获取结束时间
        System.out.println("单条记录完成计算时间： "+(endTime-startTime)/1000000+"ns");
        save();
    }


    public  void save() throws IOException {
        long startTime=System.nanoTime();
        System.out.println("编号"+originMap.get(PRI_Name)+"单次变量如下：");
        for (String key : tableMap.keySet()) {
            System.out.println("Key: " + key + " Value: " + tableMap.get(key));
        }

        calculateTool.taskCalculateMapper.saveTable(taskTableName,PRI_Name,originMap.get(PRI_Name).intValue(),tableMap);
        System.out.println("全局变量如下：");
        for (String key : tableGlobalMap.keySet()) {
            System.out.println("Key: " + key + " Value: " + tableGlobalMap.get(key));
        }

        System.out.println("-----------------------");
        //第一次存全局变量，之后不存
        if (first_global) {
            calculateTool.taskCalculateMapper.saveTable(taskGlobalTableName,PRI_Name,id,tableGlobalMap);
            first_global=false;
        }
        long endTime=System.nanoTime(); //获取结束时间
        System.out.println("单条记录save运行时间： "+(endTime-startTime)/1000000+"s");
    }



    private Double cal_variable(String formula) throws IOException {
        long startTime=System.nanoTime();
        Double result;
        String resource = "mybatis/mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        Properties properties = new Properties();
        properties.setProperty("jdbc.driver", "com.mysql.cj.jdbc.Driver");
        properties.setProperty(
                "jdbc.url",
                "jdbc:mysql://localhost:3306/"+databaseName+"?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true");
        properties.setProperty("jdbc.username", "root");
        properties.setProperty("jdbc.password", "root");
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream,properties);
        SqlSession session = sqlSessionFactory.openSession();
        try {
            taskCalculateMapper mapper = session.getMapper(taskCalculateMapper.class);
            result=mapper.getGlobal(tableName,formula);
        } finally {
            session.close();
        }
        long endTime=System.nanoTime(); //获取结束时间
        System.out.println("cal_variable计算全局变量运行时间： "+(endTime-startTime)/1000000+"s");
        return result;
    }




    /**
     * 判断是否是全局变量，如：MAX(a),两个全局变量的四则运算，常数
     * @param formula
     * @return
     * @throws ParseException
     */
    public  boolean isGlobal(String formula) throws ParseException {
        Jep jep = new Jep(); //一个数学表达式
        jep.setAllowUndeclared(true);
        jep.getVariableTable().remove("e");
        jep.getVariableTable().remove("true");
        jep.getVariableTable().remove("false");
        jep.getVariableTable().remove("pi");
        jep.getVariableTable().remove("i");
        jep.parse(formula);
        boolean find=false;
        int length=jep.getVariableTable().keySet().size();
        if(length==0){
            find=true;
        }else if(formula.contains("MAX")||formula.contains("MIN")||formula.contains("SUM")||formula.contains("AVG")||formula.contains("COUNT"))
        {
            find=true;
        }else {
            String v = jep.getVariableTable().keySet().toString();
            String v2 = v.substring(1, v.length() - 1);
            String[] vaArray = v2.split(", ");
            for (int i = 0; i < vaArray.length; i++) {
                if(inquan(vaArray[i])){
                    find=true;
                }else {
                    find=false;
                    break;
                }
            }
        }
        return find;
    }

    /**
     * 判断是否在单次记录map中
     * @param ss
     * @return
     */
    public  boolean insingle(String ss){
        boolean find =false;
        for (String s : tableMap.keySet()) {
            if (ss.equals(s)) {
                find=true;
            }
        }
        return  find;
    }

    /**
     * 判断是否在全局map中
     * @param ss
     * @return
     */
    public  boolean inquan(String ss){
        boolean find =false;
        for (String s : tableGlobalMap.keySet()) {
            if (ss.equals(s)) {
                find=true;
            }
        }
        return  find;
    }

    /**
     * 判断是否在原来数据中
     * @param ss
     * @return
     */
    public  boolean inorigin(String ss){

        boolean find =false;
        for (String s : originMap.keySet()) {
            if (ss.equals(s)) {
                find=true;
            }
        }
        return  find;

    }


    public void config(Map<String, Object> config,TaskDetail taskDetail) throws IOException, ParseException {
        long startTime = System.nanoTime();
        id=taskDetail.getId();
        taskId=taskDetail.getTaskId();
        taskProcessRate=0.00;
        taskTableName=taskDetail.getTaskTableName();
        taskGlobalTableName=taskDetail.getTaskGlobalTableName();
        tableName=taskDetail.getTableName();
        taskName=taskDetail.getTaskName();
        taskDescription = taskDetail.getTaskDescription();
        databaseName =taskDetail.getDatabaseName();
        System.out.println("测试数据库"+tableName+databaseName);
        Iterator<Map.Entry<String, Object>> entries = config.entrySet().iterator();
        while (entries.hasNext()) {
            Map.Entry<String, Object> entry = entries.next();
            if (entry.getKey().equals("formula")) {
//                for (String formula : (ArrayList<String>) entry.getValue()) {
//                    formulas.add(formula);
//                }
                String formulas_str = (String)entry.getValue();
                String[] formulass=formulas_str.split("\n");
                for(int i=0;i<formulass.length;i++){
                    formulas.add(formulass[i]);
                }

            } else if (entry.getKey().equals("rules")) {
//                Map<String, String> rule = (Map<String, String>) entry.getValue();
//                for (Map.Entry<String, String> r_entry : rule.entrySet()) {
//                    conditions.put(r_entry.getKey(), r_entry.getValue());
//                }
                String rules_str=(String)entry.getValue();
                String[] ruless=rules_str.split("\n");
                for(int j=0;j<ruless.length;j++){
                    String rule=ruless[j];
                    String[] rule_s=rule.split(":");
                    conditions.put(rule_s[0],rule_s[1]);
                }
            }
        }
        sum=returnSum(databaseName,tableName);
        origin_set(databaseName,tableName);
        timeCreate=new Date();
        for(String s:formulas){
            System.out.println("公式有："+s);
        }
        for(String s:conditions.keySet()){
            System.out.println("条件有"+s+"操作"+conditions.get(s));
        }


        for (int i = 0; i < formulas.size(); i++) {
            String input = formulas.get(i);
            String[] nameStrArray = input.split("=");
            String p = nameStrArray[0];
            String formula = nameStrArray[1];
            if (isGlobal(formula)) {
                //全局变量
                tableGlobalMap.put(p, 0.00);
            } else {
                //单行变量
                tableMap.put(p, 0.00);
            }
            //解析公式，把需要的原生的变量存入originMap
            String re = analysis(formula);
            String[] vaArray = re.split(", ");
            for (int q = 0; q < vaArray.length; q++) {
                for (String s : originset) {
                    if (vaArray[q].equals(s)) {
                        originMap.put(s, 0.00);
                    }
                }
            }

        }
        //解析规则,把需要的变量标注
        for(int j=0;j<conditions.keySet().size();j++){
            String tag_need=analysis((String) conditions.keySet().toArray()[j]);
            System.out.println("tag_need:"+tag_need);
            String[] vaArray = tag_need.split(", ");
            for (int q = 0; q < vaArray.length; q++) {
                for (String s : originset) {
                    if (vaArray[q].equals(s)) {
                        originMap.put(s, 0.00);
                    }
                }
            }
        }


        System.out.println("单行变量有");
        System.out.println(tableMap.keySet());
        System.out.println("全局变量有");
        System.out.println(tableGlobalMap.keySet());
        System.out.println("需要的变量有");
        System.out.println(originMap.keySet());

        for(String s:conditions.keySet()){
            String os=conditions.get(s);
            System.out.println("os"+os);

            if(os.contains(",")){
                String[] nameStrArray=os.split(",");
                for(int i=0;i<nameStrArray.length;i++){
                    String []tagName=nameStrArray[i].split("=");
                    tag_set.add(tagName[0]);
                }

            }else {
                String []tagName1=os.split("=");
                tag_set.add(tagName1[0]);
            }

        }
        System.out.println("标签有"+tag_set.toString());
        //创建两表
        List<String> list_table=new ArrayList<>();
        for(String key:tableMap.keySet()){
            list_table.add(key);
        }

        calculateTool.taskCalculateMapper.createTable(taskTableName,PRI_Name,PRI_Type,list_table,tag_set);

        List<String> list_global=new ArrayList<>();
        for(String key:tableGlobalMap.keySet()){
            list_global.add(key);
        }
        Set<String> tag_global=new HashSet<>();
        calculateTool.taskCalculateMapper.createTable(taskGlobalTableName,PRI_Name,"int",list_global ,tag_global);

        long endTime = System.nanoTime(); //获取结束时间
        System.out.println("config程序运行时间： " + (endTime - startTime) / 1000000 + "ns");

    }

    public List<Map> origin_set(String databaseName, String tableName) throws IOException {
        long startTime = System.nanoTime();
        List<Map> map;
        String resource = "mybatis/mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        Properties properties = new Properties();
        properties.setProperty("jdbc.driver", "com.mysql.cj.jdbc.Driver");
        properties.setProperty(
                "jdbc.url",
                "jdbc:mysql://localhost:3306/"+databaseName+"?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true");
        properties.setProperty("jdbc.username", "root");
        properties.setProperty("jdbc.password", "root");
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream,properties);
        SqlSession session = sqlSessionFactory.openSession();

        try {
            taskCalculateMapper mapper = session.getMapper(taskCalculateMapper.class);
            map=mapper.origin_set2(tableName);

        } finally {
            session.close();
        }
        for(Map<String,Object> kv : map){
            String COLUMN_NAME=String.valueOf(kv.get("COLUMN_NAME"));
            if(String.valueOf(kv.get("COLUMN_KEY")).equals("PRI")){
                originMap.put(COLUMN_NAME,0.00);
                PRI_Name=COLUMN_NAME;
                PRI_Type=String.valueOf(kv.get("COLUMN_TYPE"));
            }
            originset.add(COLUMN_NAME);
        }
        long endTime = System.nanoTime(); //获取结束时间
        System.out.println("origin_set程序运行时间： " + (endTime - startTime) / 1000000 + "ns");
        return map;
    }

    public int returnSum(String databaseName,String tableName) throws IOException {
        long startTime = System.nanoTime();
        int result=0;
        String resource = "mybatis/mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        Properties properties = new Properties();
        properties.setProperty("jdbc.driver", "com.mysql.cj.jdbc.Driver");
        properties.setProperty(
                "jdbc.url",
                "jdbc:mysql://localhost:3306/"+databaseName+"?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true");
        properties.setProperty("jdbc.username", "root");
        properties.setProperty("jdbc.password", "root");
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream,properties);
        SqlSession session = sqlSessionFactory.openSession();

        try {
            taskCalculateMapper mapper = session.getMapper(taskCalculateMapper.class);
            result=mapper.getSum2(tableName);

        } finally {
            session.close();
        }
        long endTime = System.nanoTime(); //获取结束时间
        System.out.println("returnSum程序运行时间： " + (endTime - startTime) / 1000000 + "ns");
        return result;
    }

    /**
     * jep解析
     * @param formula
     * @return "a,b,c"
     */
    public  String analysis(String formula) {
        Jep jep = new Jep(); //一个数学表达式
        String str = "";
        jep.setAllowUndeclared(true);
        jep.getVariableTable().remove("e");
        jep.getVariableTable().remove("true");
        jep.getVariableTable().remove("false");
        jep.getVariableTable().remove("pi");
        jep.getVariableTable().remove("i");
        try {
            jep.parse(formula);
            String v = jep.getVariableTable().keySet().toString();
            str = v.substring(1, v.length() - 1);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return str;
    }


}