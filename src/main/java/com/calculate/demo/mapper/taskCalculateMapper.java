package com.calculate.demo.mapper;

import com.calculate.demo.entity.TaskDetail;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Mapper
public interface taskCalculateMapper {
    //@Select("select count(*) from ${tableName}")
    int getSum2(@Param("tableName") String tableName);

    List<Map<String,Object>> selectAll(@Param("tableName") String tableName);

    List<Map> origin_set2(@Param("tableName") String tableName);

    void createTable(@Param("tableName") String tableName,@Param("PRI_Name") String PRI_Name,@Param("PRI_Type") String PRI_Type, @Param("columns")List<String> columns,@Param("tag") Set<String> tag);

    Double getGlobal(@Param("tableName") String tableName,@Param("global") String global);

    void updateTag(@Param("tableName") String tableName,@Param("PRI_Name") String PRI_Name,@Param("PRI_Value") int PRI_Value,@Param("tag_name") String tag_name,@Param("tag_value") String tag_value);



    void saveTable(@Param("tableName") String tableName,@Param("PRI_Name") String PRI_Name,@Param("PRI_Values") int PRI_Values,@Param("columns")Map<String,Object> columns);
}
