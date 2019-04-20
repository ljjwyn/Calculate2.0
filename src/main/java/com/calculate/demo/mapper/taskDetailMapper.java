package com.calculate.demo.mapper;

import com.calculate.demo.entity.TaskDetail;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.context.annotation.Bean;

import java.util.Date;
import java.util.List;

@Mapper
public interface taskDetailMapper {
    TaskDetail findByTaskId(@Param("taskId") String taskId);

    List<TaskDetail> findAll();

    void save_process(@Param("process") Double process,@Param("taskId") String taskId);

    void completeTime(@Param("completeTime") Date completeTime, @Param("taskId") String taskId);

    int insertAndReturnId(@Param("taskDetail") TaskDetail taskDetail);

    void updateTableName(@Param("taskDetail") TaskDetail taskDetail);

    Double findProcess(@Param("taskId") String taskId);
}
