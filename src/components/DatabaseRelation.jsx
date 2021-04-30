import React from 'react'
import './DatabaseRelation.scss'
import axios from "axios";
import GCtx from "../GCtx";
import {Button, Tree} from 'antd'
import {CaretDownOutlined, TagOutlined} from '@ant-design/icons'
import moment from 'moment';
import KToyDiv from "./KToyDiv";
import KToySvgLine from "./KToySvgLine";

export default class DatabaseRelation extends React.Component {
  static contextType = GCtx;

  gMapTablesInfo = new Map();
  gMapKnownTablesInfo = new Map();
  gTableUnknownSelected = [];
  gTableKnownSelected = [];
  gMapFlags = new Map();
  gMapFlagTimers = new Map();
  gCounter = 0;
  gTablesKnown = [];
  gTablesUnknown = [];
  gRefDomMain = React.createRef();

  gMapDivToyRefs = new Map();
  gDivToys = [];

  constructor(props) {
    super(props);

    this.state = {
      message: '',
      tablesAll: [],
      tablesUnknown: [],
      tablesKnown: [],
      dbUsersTreeData: [],
      productsTreeData: [],
      dbTypeTreeData: [],
      styleDialogSqlGenerated: {display: "none"},
      styleDialogHistoryCompare: {display: "none"},
      sqlGenerated: "",
      divToys: [],
      svgLineToys: [],
      styles: new Map(),
    }

    this.test = this.test.bind(this);
    this.doGetProducts = this.doGetProducts.bind(this);
    this.doGetSchemaKnown = this.doGetSchemaKnown.bind(this);
    this.doGetSchemaAll = this.doGetSchemaAll.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onTableUnknownChecked = this.onTableUnknownChecked.bind(this);
    this.onTableKnownChecked = this.onTableKnownChecked.bind(this);
    this.doTablesCompare = this.doTablesCompare.bind(this);
    this.onButtonInClicked = this.onButtonInClicked.bind(this);
    this.onButtonOutClicked = this.onButtonOutClicked.bind(this);
    this.doGetProductInfo = this.doGetProductInfo.bind(this);
    this.doGetProductLineInfo = this.doGetProductLineInfo.bind(this);
    this.doGetTableRecords = this.doGetTableRecords.bind(this);
    this.onButtonExportClicked = this.onButtonExportClicked.bind(this);
    this.onButtonSqlGeneratedClicked = this.onButtonSqlGeneratedClicked.bind(this);
    this.onButtonHistoryCompareClicked = this.onButtonHistoryCompareClicked.bind(this);
    this.onButtonCloseDialogDynamicSqlGeneratedClicked = this.onButtonCloseDialogDynamicSqlGeneratedClicked.bind(this);
    this.onButtonCloseDialogDynamicHistoryCompareClicked = this.onButtonCloseDialogDynamicHistoryCompareClicked.bind(this);
    this.onButtonTestClicked = this.onButtonTestClicked.bind(this);
    this.onDivToyClick = this.onDivToyClick.bind(this);
  }

  test(s) {
    console.log(s);
  }

  componentDidMount() {
    //this.doGetProducts();
    //this.doGetSchemaKnown();
    //this.doGetSchemaAll();
  }

  doGetTableRecords(sql) {
    return axios.post("http://" + this.context.serviceIp + ":8090/rest/mysql/select", {
        sql: sql,
        pageRows: 0,
        pageNum: 0,
        tag: "test by K"
      },
      {
        headers: {  //头部参数
          'Content-Type': 'application/json'
        }
      })
  }

  doSqlExecuteMySql(sql) {
    return axios.post("http://" + this.context.serviceIp + ":8090/rest/mysql/execute", {
        sql: sql,
        pageRows: 0,
        pageNum: 0,
        tag: "test by K"
      },
      {
        headers: {  //头部参数
          'Content-Type': 'application/json'
        }
      })
  }

  doGetProductInfo() {
    let strSql = "select * from tad_product_info"
    return axios.post("http://" + this.context.serviceIp + ":8090/rest/mysql/select", {
        sql: strSql,
        pageRows: 0,
        pageNum: 0,
        tag: "test by K"
      },
      {
        headers: {  //头部参数
          'Content-Type': 'application/json'
        }
      })
  }

  doGetProductLineInfo() {
    let strSql = "select * from tad_product_line_info"
    return axios.post("http://" + this.context.serviceIp + ":8090/rest/mysql/select", {
        sql: strSql,
        pageRows: 0,
        pageNum: 0,
        tag: "test by K"
      },
      {
        headers: {  //头部参数
          'Content-Type': 'application/json'
        }
      })
  }

  doGetProducts() {
    let productsTreeData = [];

    let sqlProductInfo = "select" +
      " product_id, product_name, product_desc, product_create_time" +
      " from tad_product_info";
    let sqlProductLineInfo = "select" +
      " product_line_id, product_line_name, product_line_desc" +
      " from tad_product_line_info";
    let strProductRel = "select" +
      " product_line_id, product_id " +
      " from tad_product_rel";
    let sqlModuleInfo = "select" +
      " module_id, module_name, module_leader, product_id, module_desc" +
      " from tad_module_info";
    let sqlDbUserInfo = "select" +
      " user_id, user_name, product_line_id, user_desc" +
      " from tad_db_user";
    let sqlDbTypeInfo = "select" +
      " db_id, db_name" +
      " from tad_db_type_info";

    let mapProductInfo = new Map();
    let mapProductLineInfo = new Map();
    let mapProductRel = new Map();
    let mapDbUserInfo = new Map();
    let mapDbTypeInfo = new Map();
    let mapModuleInfo = new Map();
    let arrProductLineInfo = [];
    let dbUsersTreeData = [];
    let dbTypeTreeData = [];

    axios.all([
      this.doGetTableRecords(sqlProductInfo),
      this.doGetTableRecords(sqlProductLineInfo),
      this.doGetTableRecords(strProductRel),
      this.doGetTableRecords(sqlModuleInfo),
      this.doGetTableRecords(sqlDbUserInfo),
      this.doGetTableRecords(sqlDbTypeInfo)
    ])
      .then(axios.spread((
        productInfo,
        productLineInfo,
        productRel,
        moduleInfo,
        dbUserInfo,
        dbTypeInfo) => {

        dbTypeInfo.data.records.forEach(function (item) {
          let dbId = item.fieldValues[0];
          if (!mapDbTypeInfo.has(dbId)) {
            mapDbTypeInfo.set(dbId, {
              dbName: item.fieldValues[1]
            });

            dbTypeTreeData.push({
              title: item.fieldValues[1],
              key: dbId,
              children: []
            })
          }
        })

        dbUserInfo.data.records.forEach(function (item) {
          let userId = item.fieldValues[0];
          if (!mapDbUserInfo.has(userId)) {
            mapDbUserInfo.set(userId, {
              userName: item.fieldValues[1],
              productLineId: [item.fieldValues[2]],
              userDesc: item.fieldValues[3]
            });

            dbUsersTreeData.push({
              title: item.fieldValues[1],
              key: userId,
              children: []
            })
          } else {
            mapDbUserInfo.get(userId).productLineId.push(item.fieldValues[2]);
          }
        })

        moduleInfo.data.records.forEach(function (item) {
          let moduleId = item.fieldValues[0];
          mapModuleInfo.set(moduleId, {
            moduleName: item.fieldValues[1],
            moduleLeader: item.fieldValues[2],
            productId: item.fieldValues[3],
            moduleDesc: item.fieldValues[4]
          })
        })

        productInfo.data.records.forEach(function (item) {
          let productId = item.fieldValues[0];
          mapProductInfo.set(productId, {
            productName: item.fieldValues[1],
            productDesc: item.fieldValues[2],
            productCreateTime: item.fieldValues[3]
          })
        })

        productLineInfo.data.records.forEach(function (item) {
          let productLineId = item.fieldValues[0];
          mapProductLineInfo.set(productLineId, {
            productLineName: item.fieldValues[1],
            productLineDesc: item.fieldValues[2]
          });
          arrProductLineInfo.push({
            name: item.fieldValues[1],
            id: item.fieldValues[0]
          });
        })

        productRel.data.records.forEach(function (item) {
          let productLineId = item.fieldValues[0];
          let productId = item.fieldValues[1];
          if (!mapProductRel.has(productLineId)) {
            mapProductRel.set(productLineId, [{
              productId: productId
            }]);
          } else {
            mapProductRel.get(productLineId).push({
              productId: productId
            })
          }
        });

        arrProductLineInfo.forEach(function (itemProductLine) {
          let nodeProductLine = {
            title: itemProductLine.name,
            key: itemProductLine.id,
            children: []
          }

          let arrProductIds = mapProductRel.get(itemProductLine.id);
          arrProductIds.forEach(function (itemProductId) {
            nodeProductLine.children.push({
              title: mapProductInfo.get(itemProductId.productId).productName,
              key: itemProductLine.id + "-" + itemProductId.productId,
              children: []
            });

            mapModuleInfo.forEach(function (value, key) {
              if (value.productId === itemProductId.productId) {
                nodeProductLine.children[nodeProductLine.children.length - 1].children.push({
                  title: value.moduleName,
                  key: itemProductLine.id + "-" + itemProductId.productId + "-" + key,
                  children: []
                })
              }
            })
          })

          productsTreeData.push(nodeProductLine);
        })

        this.setState({
          dbTypeTreeData: dbTypeTreeData,
          dbUsersTreeData: dbUsersTreeData,
          productsTreeData: productsTreeData
        });
      }));
  }

  doGetSchemaKnown() {
    let strSql = "select" +
      " t.table_name table_name, " +
      " c.column_name field_name" +
      " from tad_table t, tad_table_column c" +
      " where t.table_name = c.table_name"
    axios.post(
      "http://" + this.context.serviceIp + ":8090/rest/mysql/select",
      {
        sql: strSql,
        pageRows: 0,
        pageNum: 0,
        tag: "do get schema"
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((response) => {
      let data = response.data;
      //let columns = [];
      let tableInfo = {
        table_name: {index: 0},
        field_name: {index: 1},
        field_key: {index: 0},
        field_type: {index: 0},
        field_length: {index: 0},
        field_nullable: {index: 0}
      }

      for (let i = 0; i < data.records.length; i++) {
        //let v = {key: i};
        let tName = data.records[i].fieldValues[tableInfo.table_name.index].toLowerCase();
        let fName = data.records[i].fieldValues[tableInfo.field_name.index].toLowerCase();
        let fKey = ""; //data.records[i].fieldValues[tableInfo.field_key.index].toLowerCase();
        let fType = ""; //data.records[i].fieldValues[tableInfo.field_type.index].toLowerCase();
        let fLength = 0; //data.records[i].fieldValues[tableInfo.field_length.index];
        let fNullable = ""; //data.records[i].fieldValues[tableInfo.field_nullable.index].toLowerCase();
        let fWritable = "yes";
        if (!this.gMapKnownTablesInfo.has(tName)) {
          this.gMapKnownTablesInfo.set(tName, {fields: new Map()});
          this.gMapKnownTablesInfo.get(tName).fields.set(fName, {
            "isPrimaryKey": fKey === "pri",
            "type": fType,
            "length": fLength,
            "isNullable": fNullable === "yes",
            "isWritable": fWritable === "yes"
          });
        } else {
          this.gMapKnownTablesInfo.get(tName).fields.set(fName, {
            "isPrimaryKey": fKey === "pri",
            "type": fType,
            "length": fLength,
            "isNullable": fNullable === "yes",
            "isWritable": fWritable === "yes"
          });
        }

        if (this.gMapKnownTablesInfo.get(tName).fields.get(fName).isPrimaryKey)
          this.gMapKnownTablesInfo.get(tName).fields.get(fName).isWritable = false;

        // for (let j = 0; j < columns.length; j++) {
        //   Object.defineProperty(v, columns[j],
        //     {value: data.records[i].fieldValues[j], enumerable: true, writable: true});
        // }
      }

      this.gMapKnownTablesInfo.forEach((value1, key1) => {
        let tables = {
          title: key1,
          key: key1,
          children: []
        }

        value1.fields.forEach(function (value2, key2) {
          let fields = {
            title: key2,
            key: key1 + "__" + key2,
            children: [],
            checkable: false
          }
          tables.children.push(fields);

          Object.keys(value2).forEach(function (item) {
            fields.children.push({
              title: item + " : " + value2[item],
              key: key1 + "__" + key2 + "__" + item,
              children: [],
              checkable: false,
              //isLeaf: true,
              icon: <TagOutlined/>
            })
          })
        });

        this.gTablesKnown.push(tables);
      });

      this.setState({
        tablesKnown: this.gTablesKnown
      })

    }).catch(function (error) {
      console.log(error);
    });
  }

  doGetSchemaAll() {
    axios.post(
      "http://" + this.context.serviceIp + ":8090/rest/mysql/schema",
      {
        sql: "",
        pageRows: 0,
        pageNum: 0,
        tag: "do get schema"
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((response) => {
      let data = response.data;
      let columns = [];
      let tableInfo = {
        table_name: {columnIndex: 0},
        field_name: {columnIndex: 0},
        field_key: {columnIndex: 0},
        field_type: {columnIndex: 0},
        field_length: {columnIndex: 0},
        field_nullable: {columnIndex: 0}
      }
      for (let i = 0; i < data.table.tableFields.length; i++) {
        let fieldName = data.table.tableFields[i].fieldName;
        columns.push(fieldName);

        switch (fieldName) {
          case "table_name":
            tableInfo.table_name.columnIndex = i;
            break
          case "field_name":
            tableInfo.field_name.columnIndex = i;
            break
          case "field_key":
            tableInfo.field_key.columnIndex = i;
            break
          case "field_type":
            tableInfo.field_type.columnIndex = i;
            break
          case "field_length":
            tableInfo.field_length.columnIndex = i;
            break
          case "field_nullable":
            tableInfo.field_nullable.columnIndex = i;
            break
          default:
            break
        }
      }

      for (let i = 0; i < data.records.length; i++) {
        let v = {key: i};
        let tName = data.records[i].fieldValues[tableInfo.table_name.columnIndex].toLowerCase();
        let fName = data.records[i].fieldValues[tableInfo.field_name.columnIndex].toLowerCase();
        let fKey = data.records[i].fieldValues[tableInfo.field_key.columnIndex].toLowerCase();
        let fType = data.records[i].fieldValues[tableInfo.field_type.columnIndex].toLowerCase();
        let fLength = data.records[i].fieldValues[tableInfo.field_length.columnIndex];
        let fNullable = data.records[i].fieldValues[tableInfo.field_nullable.columnIndex].toLowerCase();
        let fWritable = "yes";
        if (!this.gMapTablesInfo.has(tName)) {
          this.gMapTablesInfo.set(tName, {fields: new Map()});
          this.gMapTablesInfo.get(tName).fields.set(fName, {
            "isPrimaryKey": fKey === "pri",
            "type": fType,
            "length": fLength,
            "isNullable": fNullable === "yes",
            "isWritable": fWritable === "yes"
          });
        } else {
          this.gMapTablesInfo.get(tName).fields.set(fName, {
            "isPrimaryKey": fKey === "pri",
            "type": fType,
            "length": fLength,
            "isNullable": fNullable === "yes",
            "isWritable": fWritable === "yes"
          });
        }

        if (this.gMapTablesInfo.get(tName).fields.get(fName).isPrimaryKey) this.gMapTablesInfo.get(tName).fields.get(fName).isWritable = false;

        for (let j = 0; j < columns.length; j++) {
          Object.defineProperty(v, columns[j],
            {value: data.records[i].fieldValues[j], enumerable: true, writable: true});
        }
      }

      let tablesAll = [];
      this.gMapTablesInfo.forEach(function (value1, key1) {
        let tables = {
          title: key1,
          key: key1,
          children: []
        }

        value1.fields.forEach(function (value2, key2) {
          let fields = {
            title: key2,
            key: key1 + "__" + key2,
            children: [],
            checkable: false
          }
          tables.children.push(fields);

          Object.keys(value2).forEach(function (item) {
            fields.children.push({
              title: item + " : " + value2[item],
              key: key1 + "__" + key2 + "__" + item,
              children: [],
              checkable: false,
              //isLeaf: true,
              icon: <TagOutlined/>
            })
          })
        });

        tablesAll.push(tables);
      });

      //todo:: this.doGetConfig();

      this.setState({
        tablesAll: tablesAll
      })
    }).catch(function (error) {
      console.log(error);
    });
  }

  onSelect(selectedKeys, info) {
    // console.log('selected', selectedKeys, info);
  };

  onTableUnknownChecked(checkedKeys, info) {
    console.log('onCheck', checkedKeys, info);
    this.gTableUnknownSelected = info.checkedNodes;
  };

  onTableKnownChecked(checkedKeys, info) {
    console.log('onCheck', checkedKeys, info);
    this.gTableKnownSelected = info.checkedNodes;
  };

  doTablesCompare() {
    //let tablesUnknown = JSON.parse(JSON.stringify(this.state.tablesUnknown));
    const {tablesKnown, tablesAll} = this.state;
    for (let i = 0; i < tablesAll.length; i++) {
      let isFound = false;
      for (let j = 0; j < tablesKnown.length; j++) {
        if (tablesAll[i].title === tablesKnown[j].title) {
          isFound = true;
          break;
        }
      }
      if (!isFound) {
        this.gTablesUnknown.push(tablesAll[i]);
      }
    }

    this.setState({
      tablesUnknown: this.gTablesUnknown
    })
  }

  onButtonInClicked() {
    for (let i = 0; i < this.gTableKnownSelected.length; i++) {
      let isFound = false;
      for (let j = this.gTablesUnknown.length - 1; j >= 0; j--) {
        if (this.gTablesUnknown[j].title === this.gTableKnownSelected[i].title) {
          isFound = true;
          break
        }
      }
      if (!isFound) {
        this.gTablesUnknown.push(this.gTableKnownSelected[i]);
      }
    }

    this.setState({
      tablesUnknown: JSON.parse(JSON.stringify(this.gTablesUnknown))
    })
  }

  onButtonOutClicked() {
    this.gTableUnknownSelected.forEach((item) => {
      for (let i = this.gTablesUnknown.length - 1; i >= 0; i--) {
        if (this.gTablesUnknown[i].title === item.title) {
          this.gTablesUnknown.splice(i, 1);
          break
        }
      }
    })

    this.setState({
      tablesUnknown: JSON.parse(JSON.stringify(this.gTablesUnknown))
    })
  }

  /**
   *
   * 对比只针对数据库用户下所有表的导出才提供，自定义选的，只提供所选项目和历史对比
   * 表数据内容会变
   * 字段会变（字段增多，减少，字段类型改变，字段长度改变 export_table_column_publish
   * 索引会变 tad_table_index_publish
   * 分区会变 tad_table_partition_publish
   */
  onButtonExportClicked() {
    let timePublish = moment().format('yyyy-MM-DD HH:mm:ss');

    for(let i = 0; i < this.gTablesUnknown.length; i++) {
      let tableName = this.gTablesUnknown[i].title;
      for(let j = 0; j < this.gTablesUnknown[i].children.length; j++) {
        let columnName = this.gTablesUnknown[i].children[j].title;
        let sqlTable = "insert into tad_table_column_publish(table_name, column_name, publish_time) values('" +
          tableName + "', '" +
          columnName + "', '" +
          timePublish + "')";
        axios.post("http://" + this.context.serviceIp + ":8090/rest/mysql/execute",
          {sql: sqlTable, pageRows: 0, pageNum: 0, tag: ""},
          {headers: {'Content-Type': 'application/json'}}
        ).then((response) => {
          let data = response.data;
          if (data.code !== 200) {
            console.log("error! code = " + data.code);
          }
        });
      }
    }
    console.log("导出入库指令已经下发完成， 时间戳：" + timePublish);
  }

  onButtonSqlGeneratedClicked() {
    let style = {
      display: "grid",
      width: this.gRefDomMain.current.offsetWidth,
      height: this.gRefDomMain.current.offsetHeight,
      left: this.gRefDomMain.current.offsetLeft,
      top: this.gRefDomMain.current.offsetTop
    }

    this.setState({
      styleDialogSqlGenerated: style
    });

    let strSql = "";
    for(let i = 0; i < this.gTablesUnknown.length; i++) {
      let tableName = this.gTablesUnknown[i].title;
      strSql += "create table " + tableName + "(\n";
      for(let j = 0; j < this.gTablesUnknown[i].children.length; j++) {
        let columnName = this.gTablesUnknown[i].children[j].title;
        strSql += "\t" + columnName + ",\n";
      }
      strSql = strSql.substr(0, strSql.length -2);
      strSql += ");\n\n"
    }
    this.setState({
      sqlGenerated: strSql
    });
  }

  onButtonCloseDialogDynamicSqlGeneratedClicked() {
    let style = {
      display: "none"
    }

    this.setState({
      styleDialogSqlGenerated: style
    })

  }

  onButtonCloseDialogDynamicHistoryCompareClicked() {
    let style = {
      display: "none"
    }

    this.setState({
      styleDialogHistoryCompare: style
    })

  }

  onButtonHistoryCompareClicked() {
    let style = {
      display: "grid",
      width: this.gRefDomMain.current.offsetWidth,
      height: this.gRefDomMain.current.offsetHeight,
      left: this.gRefDomMain.current.offsetLeft,
      top: this.gRefDomMain.current.offsetTop
    }

    this.setState({
      styleDialogHistoryCompare: style
    });

  }

  onDivToyClick(e) {

  }

  onButtonTestClicked() {
    this.gCounter++;
    let ref = React.createRef();
    let id = "divToy_" + this.gCounter;
    let element = <KToyDiv
        id={id}
        key={id}
        ref={this.context.gRefDivToy}
        // className={"DivToy"}
        onClick={this.onDivToyClick}/>
    let line = <KToySvgLine ref={this.context.gRefLine}/>

    this.gMapDivToyRefs.set(id, {
      ref: ref
    });

    let {divToys, svgLineToys} = this.state;

    divToys.push(element);
    svgLineToys.push(line);
    this.setState((prevState) => {
      delete prevState.divToys
      delete prevState.svgLineToys
      return prevState
    })
    this.setState({
      divToys: divToys,
      svgLineToys: svgLineToys
    })

    setTimeout(() => {
      //console.log();
      //this.gRefLine.current.changePosition(this.gRefLine.current.changePosition);

    }, 2000)
  }

  render() {
    return <div ref={this.gRefDomMain} className="DatabaseRelation">
      <div className={"BoxTablesInfo"}>
        <div className={"BoxTree"}>
          <Tree
            blockNode={true}
            showLine={true}
            showIcon={true}
            switcherIcon={<CaretDownOutlined/>}
            onSelect={this.onSelect}
            treeData={this.state.productsTreeData}
          />
        </div>
        <div className={"BoxTree"}>
          <Tree
              blockNode={true}
              onSelect={this.onSelect}
              treeData={this.state.dbUsersTreeData}
          />
        </div>
        <div className={"BoxTree"}>
          <Tree
              checkable
              blockNode={true}
              showLine={true}
              showIcon={true}
              switcherIcon={<CaretDownOutlined/>}
              onSelect={this.onSelect}
              onCheck={this.onTableKnownChecked}
              treeData={this.state.tablesKnown}
          />
        </div>
      </div>
      <div id={"BoxCanvas"} className={"BoxCanvas"}>
        <svg style={{position: 'absolute', left: 0, top: 0, width: "100%", height: "100%"}}>
          {this.state.svgLineToys.map((item) => {
            return item
          })}
        </svg>
        <Button onClick={this.onButtonTestClicked}>Test</Button>
        {this.state.divToys.map((item) => {
          return item
        })}

        {/*<svg style={{position: 'absolute', width: "100%", height: "100%", overflow: "auto"}}>*/}
        {/*  <rect width="300" height="100" x="100" y="100"*/}
        {/*        style={{fill:'rgb(0,0,255)', strokeWidth:1, stroke:'rgb(0,0,0)'}}/>*/}
        {/*  /!*<circle cx={50} cy={50} r={10} fill="rgba(255, 0, 0, 0.5)"/>*!/*/}
        {/*  /!*<rect x="0" y="0" width="100%" height="100%"/>*!/*/}
        {/*</svg>*/}
      </div>
    </div>
  }
}
