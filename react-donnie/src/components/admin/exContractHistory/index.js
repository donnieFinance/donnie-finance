import React, { useState, useEffect } from 'react'
import {Button, Space, DatePicker} from "antd";
import openApi from "~/lib/openApi";
import BigNumber from "bignumber.js";
import ComUtil from "~/util/ComUtil";
import {Div, Flex, Button as StyledButton, Hr, FilterGroup} from "~/styledComponents/shared";
import {AgGridReact} from "ag-grid-react";
import adminApi from "~/lib/adminApi";
import moment from "moment-timezone"
import iostApi from "~/lib/iostApi";
import InputFilter from '~/components/common/gridFilter/InputFilter'
import CheckboxFilter from '~/components/common/gridFilter/CheckboxFilter'
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import {MdKeyboardArrowDown, MdKeyboardArrowUp} from "react-icons/md";
const initialFilterData = {
    account: '',
    actionName: '',
    statusCode: ''
}

const ExContractHistory = (props) => {

    const [saveLoading, setSaveLoading] = useState(false);
    const [searchYear, setSearchYear] = useState(moment());
    const [data, setData] = useState([]);
    const [groupData, setGroupData] = useState([]);
    const [gridApi, setGridApi] = useState(null);

    const [isGroupOpen, setIsGroupOpen] = useState(false)

    const [filterData, setFilterData] = useState(initialFilterData)

    const [account, setAccount] = useState()
    const [userLPList, setUserLPList] = useState()

    //ag-grid 옵션
    const defaultColDef = {
        filter: true,
        resizable: true,
        sortable: true,
        floatingFilter: false
    };
    const gridOptions = {
        columnDefs: [
            { headerName: "_id", field: "txId", width: 100 },
            { headerName: "actionName", field: "actionName", width: 100 },
            { headerName: "from", field: "from", width: 100 },
            { headerName: "data", field: "data", width: 150 },
            { headerName: "dataField1", field: "dataField1", width: 100 },
            { headerName: "dataField2", field: "dataField2", width: 100 },
            { headerName: "dataField3", field: "dataField3", width: 150 },
            { headerName: "dataField4", field: "dataField4", width: 150 },
            { headerName: "dataField3_num", field: "dataField3_num", width: 70,
                valueGetter: function({data}){
                    try{
                        if (parseFloat(data.dataField3) > 0){
                            return parseFloat(data.dataField3)
                        }else{
                            return 0
                        }
                    }catch (err){
                        return data.dataField3
                    }
                }
            },
            {
                headerName: "dataField4_num", field: "dataField4", width: 70,
                valueGetter: function ({data}) {
                    try {
                        if (parseFloat(data.dataField4) > 0) {
                            return parseFloat(data.dataField4)
                        } else {
                            return 0
                        }
                    } catch (err) {
                        return data.dataField4
                    }
                }
            },
            { headerName: "dataField5", field: "dataField5", width: 100 },
            { headerName: "dataField6", field: "dataField6", width: 30 },
            { headerName: "statusCode", field: "statusCode", width: 100 },
            {
                headerName: "createdAt", field: "createdAt", width: 170,
                valueGetter: function(params){
                    const v_Date = params.data.createdAt ? ComUtil.utcToString(params.data.createdAt, 'YYYY.MM.DD HH:mm:ss') : null;
                    return v_Date;
                }
            },
            // {
            //     headerName: "createdAtLong", field: "createdAtLong", width: 50,
            //     filter:"agNumberColumnFilter",
            //     valueGetter: function(params){
            //         return parseInt(params.data.createdAtLong);
            //     }
            // },
            { headerName: "returnData", field: "returnData", width: 100 },
            { headerName: "txHash", field: "txHash", width: 100 },
            { headerName: "index", field: "index", width: 30 },
            { headerName: "block", field: "block", width: 100 },
            { headerName: "contract", field: "contract", width: 100 },
        ],
        onGridReady: onGridReady
    }

    useEffect(() => {
        search()
    }, [])

    useEffect(() => {

        if (filterData.account) {
            searchLpTokenList(filterData.account)
        }
    }, [filterData])

    const searchLpTokenList = async (account) => {
        const result =  await iostApi.getMyLpTokenListInfo(account)
        setAccount(filterData.account)
        setUserLPList(result)
    }

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    function onGridReady (params) {
        setGridApi(params.api);
    };

    function copy ({value}) {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    const onSaveClick = async () => {
        setSaveLoading(true)
        const {data:data1} = await adminApi.setExContractHistory("1");
        const {data:data2} = await adminApi.setExContractHistory("2");
        if(data1 && data2){
            alert('저장되었습니다.')
            setSaveLoading(false)
        }else{
            setSaveLoading(false)
        }
    }

    const onSearchClick = () => {
        search()
    }

    const search = async() => {

        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }

        const params = {
            year:searchYear.year()
        }
        const {data} = await adminApi.getExContractHistory(params)
        setData(data)

        const groupData = []
        const accounts = []

        data.map((item, index) => {

            if (item.statusCode === 'SUCCESS'){
                //없는 경우
                if (!accounts.includes(item.from)) {

                    accounts.push(item.from)

                    const newItem = {
                        account: item.from,
                        txCount: 1
                    }

                    groupData.push(newItem)

                }else {

                    const groupItem = groupData.find(row => row.account === item.from)

                    groupItem.txCount = groupItem.txCount + 1
                }
            }
        })

        console.log(groupData)

        ComUtil.sortNumber(groupData, 'txCount')

        setGroupData(groupData)

        //ag-grid api
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()
        }
    }
    const onAccountClick = (account) => {
        setFilter({
            from: {
                filterType: 'text',
                type: 'startsWith',
                filter: account
            }
        })

        setFilterData({
            ...filterData,
            account: account
        })
    }

    const groupToggle = () => {
        setIsGroupOpen(!isGroupOpen)
    }

    //필터 클리어
    const clearAllFilter = () => {
        gridApi.setFilterModel(null);
        setFilterData(initialFilterData)
    }

    const actionNameFilter = (actionName) => {
        setFilter({
            actionName: {
                filterType: 'text',
                type: 'contains',
                filter: actionName
            }
        })

        setFilterData({
            ...filterData,
            actionName: actionName
        })
    }

    const statusCodeFilter = (statusCode) => {
        setFilter({
            statusCode: {
                filterType: 'text',
                type: 'contains',
                filter: statusCode
            }
        })

        setFilterData({
            ...filterData,
            statusCode: statusCode
        })
    }

    const clearOneFilter = (column) => {
        gridApi.destroyFilter(column);
        const newFilterData = {...filterData}
        newFilterData[column] = ''
        setFilterData(newFilterData)
    }

    const setFilter = (filter) => {
        const model = gridApi.getFilterModel();
        gridApi.setFilterModel({
            ...model,
            ...filter
        })
    }

    const onFilterDataClick = () => {
        const model = gridApi.getFilterModel();

        console.log("model====",model)
        //
        gridApi.setFilterModel({
            ...model,
            actionName:{
                filterType: "text",
                operator: "OR",
                condition1: {
                    filterType: 'text',
                    type: 'contains',
                    filter: 'addLiquidity'
                },
                condition2: {
                    filterType: 'text',
                    type: 'contains',
                    filter: 'withdrawLiquidityWithLp'
                }
            },
            dataField1:{
                filterType: "text",
                operator: "OR",
                condition1: {
                    filterType: 'text',
                    type: 'contains',
                    filter: 'don'
                },
                condition2: {
                    filterType: 'text',
                    type: 'contains',
                    filter: 'iost'
                }
            },
            dataField2:{
                filterType: "text",
                operator: "OR",
                condition1: {
                    filterType: 'text',
                    type: 'contains',
                    filter: 'iost'
                },
                condition2: {
                    filterType: 'text',
                    type: 'contains',
                    filter: 'don'
                }
            },
            statusCode:{
                filterType: 'text',
                type: 'contains',
                filter: 'SUCCESS'
            },
            createdAtLong:{
                filter: 20210503000000,
                filterTo: 20210510162904,
                filterType: "number",
                type: "inRange"
            }
        })
    }

    function onDateChange(date, dateString) {
        console.log(date, dateString);
        //console.log("year",dateString)
        if(date === null){
            date = moment();
        }
        setSearchYear(date);
    }



    return (
        <div>

            <Space>
                <DatePicker
                    onChange={onDateChange} picker="year"
                    inputReadOnly={false}
                    defaultValue={searchYear}
                    value={searchYear}
                />
                <Button onClick={onSaveClick} loading={saveLoading}>수동 API 저장</Button>
                <Button onClick={onSearchClick}>조회</Button>
            </Space>
            <Div mt={10}>
                <Flex justifyContent={'space-between'}>
                    <Div>
                        <Button fontSize={12} bg={'white'} bc={'light'} onClick={groupToggle}>
                            <Flex>
                                <Div mr={5}> 사용자 필터 (SUCCESS 만 집계) | Total {groupData.length} </Div>
                                {isGroupOpen ? <MdKeyboardArrowUp size={16} /> : <MdKeyboardArrowDown size={16} />}
                            </Flex>
                        </Button>
                    </Div>
                    <Div></Div>
                </Flex>
                <Flex flexWrap={'wrap'}>
                    {
                        isGroupOpen &&
                            groupData.map(item =>
                                <StyledButton mb={2} fontSize={12}
                                              bg={'white'} bc={filterData.account === item.account ? 'info' : 'white'}
                                              rounded={2} mr={3} py={2} px={5}
                                    // onClick={copy.bind(this, {value:item.account})}
                                    // onClick={setFilter}
                                              onClick={onAccountClick.bind(this, item.account)}
                                >{`${item.account} ${item.txCount}`}</StyledButton>
                            )
                    }
                </Flex>
            </Div>
            {
                userLPList && (
                    <Div mt={10}>
                        <Div bold>{account}</Div>
                        <Flex>
                            {
                                userLPList.map(item =>
                                    <Div bg={'white'} p={10} mr={10}>
                                        <Div>{item.lpTokenName}</Div>
                                        <Flex><Div width={150}>{item.swapPairKey} LP Total</Div><Div>{item.lpTokenBalance + item.myStakedBalance}</Div></Flex>
                                        <Flex><Div width={150}>{item.symbol1.toUpperCase()} balance</Div><Div>{item.symbol1Balance}</Div></Flex>
                                        <Flex><Div width={150}>{item.symbol2.toUpperCase()} balance</Div><Div>{item.symbol2Balance}</Div></Flex>
                                        <Flex><Div width={150}>My LP</Div><Div>{item.lpTokenBalance}</Div></Flex>
                                        <Flex><Div width={150}>Staked LP</Div><Div>{item.myStakedBalance}</Div></Flex>
                                        <Flex><Div width={150}>My LP 비율</Div><Div>{item.lpTokenBalanceRate}</Div></Flex>
                                        <hr/>
                                        <Flex><Div width={150}>{item.symbol1.toUpperCase()} Total</Div><Div>{item.symbol1Total}</Div></Flex>
                                        <Flex><Div width={150}>{item.symbol2.toUpperCase()} Total</Div><Div>{item.symbol2Total}</Div></Flex>
                                        <Flex><Div width={150}>전체 풀</Div><Div>{item.currentSupply}</Div></Flex>
                                    </Div>
                                )
                            }
                        </Flex>
                    </Div>
                )
            }
            <Div mt={10}>
                <Space>
                    <Div>ActionName</Div>
                    <StyledButton bg={'danger'} fg={'white'} rounded={5} px={10} py={2} onClick={clearOneFilter.bind(this, 'actionName')} cursor={1}>클리어</StyledButton>
                    <StyledButton bg={'white'} bc={filterData.actionName === 'addLiquidity' ? 'info' : 'white'} rounded={5} px={10} py={2} onClick={actionNameFilter.bind(this, 'addLiquidity')} cursor={1}>addLiquidity</StyledButton>
                    <StyledButton bg={'white'} bc={filterData.actionName === 'swapTokens' ? 'info' : 'white'} rounded={5} px={10} py={2} onClick={actionNameFilter.bind(this, 'swapTokens')} cursor={1}>swapTokens</StyledButton>
                    <StyledButton bg={'white'} bc={filterData.actionName === 'withdrawLiquidityWithLp' ? 'info' : 'white'} rounded={5} px={10} py={2} onClick={actionNameFilter.bind(this, 'withdrawLiquidityWithLp')} cursor={1}>withdrawLiquidityWithLp</StyledButton>
                    <StyledButton bg={'white'} bc={filterData.actionName === 'routeSwapTokens' ? 'info' : 'white'} rounded={5} px={10} py={2} onClick={actionNameFilter.bind(this, 'routeSwapTokens')} cursor={1}>routeSwapTokens</StyledButton>
                </Space>
            </Div>
            <Div mt={10}>
                <Space>
                    <Div>Success</Div>
                    <StyledButton bg={'danger'} fg={'white'} rounded={5} px={10} py={2} onClick={clearOneFilter.bind(this, 'statusCode')} cursor={1}>클리어</StyledButton>
                    <StyledButton bg={'white'} bc={filterData.statusCode === 'SUCCESS' ? 'info' : 'white'} rounded={5} px={10} py={2} onClick={statusCodeFilter.bind(this, 'SUCCESS')} cursor={1}>SUCCESS</StyledButton>
                </Space>
            </Div>
            <Flex mt={10}>
                <Space>
                    <Div>필터</Div>
                    <StyledButton bg={'danger'} fg={'white'} rounded={5} px={10} py={2} onClick={clearAllFilter}>전체 필터 클리어</StyledButton>
                    <Div >{filterData.account}</Div>
                    <Div >{filterData.actionName}</Div>
                    <Div >{filterData.statusCode}</Div>
                </Space>
            </Flex>
            <Flex mt={10}>
                <Button onClick={onFilterDataClick}>2021-05-03 ~ 2021-05-10 16:29:04 [withdrawLiquidityWithLp or addLiquidity or don/iost or iost/don]</Button>
            </Flex>

            {/* filter START */}
            <FilterContainer gridApi={gridApi}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'txId', name: 'txId'},
                            {field: 'from', name: 'from'},
                            {field: 'data', name: 'data'},
                            {field: 'dataField1', name: 'dataField1'},
                            {field: 'dataField2', name: 'dataField2'},
                            {field: 'dataField3', name: 'dataField3'},
                            {field: 'dataField4', name: 'dataField4'},
                            {field: 'dataField3_num', name: 'dataField3_num'}
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
                <Hr/>
                <FilterGroup>
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'actionName'}
                        name={'actionName'}
                        data={[
                            {value: 'swapTokens', name: 'swapTokens'},
                            {value: 'withdrawLiquidityWithLp', name: 'withdrawLiquidityWithLp'},
                            {value: 'addLiquidity', name: 'addLiquidity'},
                        ]}
                    />
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'dataField1'}
                        name={'dataField1'}
                        data={[
                            {value: 'don', name: 'don'},
                            {value: 'husd', name: 'husd'},
                            {value: 'iost', name: 'iost'},
                            {value: 'iwbnb', name: 'iwbnb'},
                        ]}
                    />
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'dataField2'}
                        name={'dataField2'}
                        data={[
                            {value: 'don', name: 'don'},
                            {value: 'husd', name: 'husd'},
                            {value: 'iost', name: 'iost'},
                            {value: 'iwbnb', name: 'iwbnb'},
                        ]}
                    />
                </FilterGroup>
            </FilterContainer>
            {/* filter END */}

            <Div>
                {/*<Flex bg={'white'} my={10} p={10}>*/}
                {/*<Div>test</Div>*/}
                {/*<Div>test</Div>*/}
                {/*<Div>test</Div>*/}
                {/*</Flex>*/}
                <Div className="ag-theme-balham" height={800} my={10}>
                    <AgGridReact
                        defaultColDef={defaultColDef}
                        gridOptions={gridOptions}
                        rowData={data}
                        onCellDoubleClicked={copy}
                    >
                    </AgGridReact>
                </Div>
            </Div>
        </div>
    );
};

export default ExContractHistory;
