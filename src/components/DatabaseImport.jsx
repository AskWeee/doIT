import React from 'react'
import './DatabaseImport.scss'
import axios from "axios";
import GCtx from "../GCtx";
import {Tree} from 'antd'
import {CaretDownOutlined, TagOutlined} from '@ant-design/icons'

export default class DatabaseImport extends React.Component {
  static contextType = GCtx;

  gMapTablesInfo = new Map();

  treeData = [
    {
      title: 'parent 1',
      key: '0-0',
      children: [
        {
          title: 'parent 1-0',
          key: '0-0-0',
          disabled: true,
          children: [
            {
              title: 'leaf',
              key: '0-0-0-0',
              disableCheckbox: true,
            },
            {
              title: 'leaf',
              key: '0-0-0-1',
            },
          ],
        },
        {
          title: 'parent 1-1',
          key: '0-0-1',
          children: [{ title: <span style={{ color: '#1890ff' }}>sss</span>, key: '0-0-1-0' }],
        },
      ],
    },
  ];

  constructor(props) {
    super(props);

    this.state = {
      message: '',
      tableNames: []
    }

    this.doGetSchema = this.doGetSchema.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onCheck = this.onCheck.bind(this);
  }

  componentDidMount() {
    this.doGetSchema();
  }

  doGetSchema() {
    console.log(this.context.serviceIp);
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
      console.log(response);
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

      let tableNames = [];
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
            children:[],
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
              icon: <TagOutlined />
            })
          })
        });

        tableNames.push(tables);
      });

      //todo:: this.doGetConfig();

      this.setState({
        tableNames: tableNames
      })

    }).catch(function (error) {
      console.log(error);
    });
  }

  onSelect(selectedKeys, info){
    console.log('selected', selectedKeys, info);
  };

  onCheck(checkedKeys, info){
    console.log('onCheck', checkedKeys, info);
  };

  // switcherIcon
  render() {
    return <div className="DatabaseImport">
      <div className={"BoxKnown"}></div>
      <Tree
        checkable
        blockNode={true}
        showLine={true}
        showIcon={true}
        switcherIcon={<CaretDownOutlined />}
        defaultExpandedKeys={['0-0-0', '0-0-1']}
        defaultSelectedKeys={['0-0-0', '0-0-1']}
        defaultCheckedKeys={['0-0-0', '0-0-1']}
        onSelect={this.onSelect}
        onCheck={this.onCheck}
        treeData={this.state.tableNames}
      />
      {/*<div className={"BoxUnknown"}>*/}
      {/*  {this.state.tableNames.map(function (item) {*/}
      {/*    return <div className={"DivTest"}>{item}</div>*/}
      {/*  })}*/}
      {/*</div>*/}
    </div>
  }
}
