package com.calculate.demo.entity;

import org.springframework.context.annotation.Bean;

import java.util.Date;

public class TaskDetail {
    private int id;
    private String taskId;
    private String taskName;
    private String taskDescription;
    private Date timeCreate;
    private Date timeCompleted;
    private String databaseName;
    private String tableName;
    private String formulas;
    private String rules;
    private String taskTableName;
    private String taskGlobalTableName;
    private Double taskProcessRate;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getTaskName() {
        return taskName;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public String getTaskDescription() {
        return taskDescription;
    }

    public void setTaskDescription(String taskDescription) {
        this.taskDescription = taskDescription;
    }

    public Date getTimeCreate() {
        return timeCreate;
    }

    public void setTimeCreate(Date timeCreate) {
        this.timeCreate = timeCreate;
    }

    public Date getTimeCompleted() {
        return timeCompleted;
    }

    public void setTimeCompleted(Date timeCompleted) {
        this.timeCompleted = timeCompleted;
    }

    public String getDatabaseName() {
        return databaseName;
    }

    public void setDatabaseName(String databaseName) {
        this.databaseName = databaseName;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public String getFormulas() {
        return formulas;
    }

    public void setFormulas(String formulas) {
        this.formulas = formulas;
    }

    public String getRules() {
        return rules;
    }

    public void setRules(String rules) {
        this.rules = rules;
    }

    public String getTaskTableName() {
        return taskTableName;
    }

    public void setTaskTableName(String taskTableName) {
        this.taskTableName = taskTableName;
    }

    public String getTaskGlobalTableName() {
        return taskGlobalTableName;
    }

    public void setTaskGlobalTableName(String taskGlobalTableName) {
        this.taskGlobalTableName = taskGlobalTableName;
    }

    public Double getTaskProcessRate() {
        return taskProcessRate;
    }

    public void setTaskProcessRate(Double taskProcessRate) {
        this.taskProcessRate = taskProcessRate;
    }
}
