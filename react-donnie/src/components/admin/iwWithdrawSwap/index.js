import React, { useState, useEffect } from 'react'
import {Div, Flex, Span} from '~/styledComponents/shared'
import styled from 'styled-components'
import {color} from '~/styledComponents/Properties'
import {getValue} from "~/styledComponents/Util";
import {Button} from 'antd'
import ComUtil from '~/util/ComUtil'
import {AgGridReact} from 'ag-grid-react';
import AdminApi from '~/lib/adminApi'
import properties from "~/properties";

const SearchBox = styled.div`
    background-color: ${color.white};
    padding: ${getValue(10)};    
    margin: ${getValue(10)}; 
    
    & > * {
        margin-right: ${getValue(10)};
    }
    
    & button {
        padding: ${getValue(5)} ${getValue(10)};
    }
`;

const IwWithdrawSwap = ({iwTokenName, ercTokenName}) => {

    // const iwTokenName = 'iwbly'; //중요: 통신용
    // const ercTokenName = 'BLY';  //display용 - 안중요.
    const [gridApi, setGridApi] = useState(null);

    const [iwTokenNm, setIwTokenNm] = useState(iwTokenName);
    const [ercTokenNm, setErcTokenNm] = useState(ercTokenName);

    // 로딩 표시
    const [loading, setLoading] = useState(true);

    // ERC출금 리스트
    const [data, setData] = useState([]);

    // 스왑매니저 정보, Eth 및 Gas 정보
    const [swapManagerAccount, setSwapManagerAccount] = useState("");
    const [swapManagerEth, setSwapManagerEth] = useState(0);
    const [managerIGas, setManagerIGas] = useState(0);
    const [managerIRam,setManagerIRam] = useState(0);
    const [ethGasGwei, setEthGasGwei] = useState(0);

    // 총 출금합계
    const [total, setTotal] = useState(0);

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
    };

    //ag-grid 옵션
    const defaultColDef = {
        filter: true,
        resizable: true,
        sortable: true,
        floatingFilter: false
    };
    const gridOptions = {
        columnDefs: [
            {
                headerName: "No", field: "withdrawSeq", width: 80, sort:'desc'
            },
            {
                headerName: "IRC계정", field: "ircAccount", width: 100
            },
            {
                headerName: "IRC 출금요청시간", field: "requestTime",
                width: 120,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                valueGetter: function(params){
                    const v_Date = params.data.requestTime ? ComUtil.utcUnixToString(params.data.requestTime, "YYYY.MM.DD HH:mm") : null;
                    return v_Date;
                }
            },
            {
                headerName: "IRC 출금요청토큰", field: "amount", width: 150
            },
            {
                headerName: "ERC 출금토큰", field: "ercWithdrawAmount", width: 150
            },
            {
                headerName: "Approve확인", field: "", width: 130, cellRenderer: 'approveRenderer'
            },
            {
                headerName: "ERC계정", field: "ercAccount", width: 150, cellRenderer: 'ethAccountRenderer'
            },
            {
                headerName: "IRC Status", field: "status", width: 120, cellRenderer: 'ircStatusRenderer'
            },
            {
                headerName: "ERC 요청시간", field: "ercRequestTime",
                width: 120,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                valueGetter: function(params){
                    const v_Date = params.data.ercRequestTime ? ComUtil.utcToString(params.data.ercRequestTime, 'YYYY.MM.DD HH:mm') : null;
                    return v_Date;
                }
            },
            {
                headerName: "ERC txHash", field: "ercTxHash", width: 200
            },
            {
                headerName: "ERC Status", field: "ercStatus", width: 200,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                cellRenderer: 'sudongSendRenderer'
            }
        ],
        frameworkComponents: {
            approveRenderer: approveRenderer,
            ethAccountRenderer: ethAccountRenderer,
            ircStatusRenderer: ircStatusRenderer,
            ercStatusRenderer: ercStatusRenderer,
            sudongSendRenderer:sudongSendRenderer
        }
    }

    useEffect(() => {
        search();
        managerBalance();
        if(gridApi) {
            gridApi.setColumnDefs([]);
            gridApi.setColumnDefs(gridOptions.columnDefs);
        }
        setIwTokenNm(iwTokenName);
        setErcTokenNm(ercTokenName);
    }, [iwTokenName])


    function ethAccountRenderer ({value}) {
        let ethScanUrl = 'https://etherscan.io/address/';
        const ropstenEthScanUrl = 'https://ropsten.etherscan.io/address/'
        if(properties.isTestMode){
            ethScanUrl = ropstenEthScanUrl;
        }
        return value && <><a href={`${ethScanUrl}${value}`} target={'_blank'} fg={'primary'} ml={10} ><u>EthScan</u></a> <span>{value}</span></>
    }
    function ircStatusRenderer({value, data:rowData}) {
        let status = '요청';
        //irc 0:request, 1:inProcess: 2:done
        const ircStatus = parseInt(rowData.status);

        if(ircStatus === 0) status = '요청'
        else if(ircStatus === 1) status = '전송중'
        else if(ircStatus === 2) status = '전송완료'

        return status
    }
    function ercStatusRenderer({value, data:rowData}) {
        let status = '요청';
        //irc 0:request, 1:inProcess: 2:done
        const ercStatus = rowData.ercStatus;

        if(ercStatus === 0) status = '요청'
        else if(ercStatus === 1) status = '전송중'
        else if(ercStatus === 2) status = '전송완료'

        return status
    }
    function approveRenderer({value, data:rowData}) {
        return (
            <div>
                {
                    rowData.ercAccount &&
                    <Span ml={10}>
                        <Button size={'small'} type={'primary'}
                                onClick={() => rowData.approveAllowanceClick()}> Approve확인
                        </Button>
                    </Span>
                }
            </div>
        )
    }
    function sudongSendRenderer(props) {
        const rowData = props.data;
        const onHandleClick = async() => {
            if(window.confirm('approve된 토큰을 수동전송 하시겠습니까?')) {
                const params = {
                    withdrawSeq: rowData.withdrawSeq,
                    iwTokenName: iwTokenName,
                    ownerIrcAccount: rowData.ircAccount,
                    receiverAddr: rowData.ercAccount,
                    tokenAmount: rowData.ercWithdrawAmount
                }
                //approve된 Iw ERC토큰 수동 전송 기능
                let {data: result} = await AdminApi.sendUserIwErcToExtAccount(params);
                alert(result);
                if (window.confirm('다시 재 검색하시겠습니까?')) {
                    search();
                }
            }
        }
        let status = '요청';
        //irc 0:request, 1:inProcess: 2:done
        const ercStatus = rowData.ercStatus;

        if(ercStatus === 0) status = '요청'
        else if(ercStatus === 1) status = '전송중'
        else if(ercStatus === 2) status = '전송완료'

        return(
            <div>
                {status}
                {
                    ercStatus < 2 &&
                    <Span ml={10}>
                        <button onClick={onHandleClick}>수동전송</button>
                    </Span>
                }
            </div>
        )
    }

    async function managerBalance() {

        const {data:swapManagerAccount} = await AdminApi.getSwapManagerAccount(); //erc SwapManager
        setSwapManagerAccount(swapManagerAccount);

        const {data:swapManagerEth} = await AdminApi.getManagerEthBalance();
        setSwapManagerEth(swapManagerEth);

        const {data:managerIgas} = await AdminApi.getDonManagerIGas(); //iw토큰들은 donswap아닌 donmanager 이용.
        setManagerIGas(managerIgas);

        const {data:managerIram} = await AdminApi.getDonManagerIRam(); //iw토큰들은 donswap아닌 donmanager 이용.
        setManagerIRam(managerIram);

        const {data:ethGasGwei} = await AdminApi.getEthGasGwei();
        setEthGasGwei(ethGasGwei);
    }


    async function search() {
        setLoading(true);
        const {data} = await AdminApi.iwIrcWithdrawSwap(iwTokenName);

        data.map(item => {
            item.withdrawSeq = parseFloat(item.withdrawSeq)
            item.amount = parseFloat(item.amount)
            item.ercWithdrawAmount = parseFloat(item.ercWithdrawAmount)
            item.requestTime = parseFloat(item.requestTime)
        })

        console.log({data})

        // return
        if(data) {
            data.map(item => item.approveAllowanceClick = function () {
                userApproveAmt(iwTokenName, item);
            })
        }

        setData(data);
        let totalWithdraw = 0;
        if(data) {
            data.map(item => {
                totalWithdraw = totalWithdraw + parseFloat(item.amount);
                // console.log(item);
            })
        }
        setTotal(totalWithdraw);
        setLoading(false);
    }

    async function userApproveAmt(iwTokenName, item) {
        const {data:approveAmt} = await AdminApi.getIwErcTokenApproved(iwTokenName, item.ircAccount);
        alert("Approve:"+approveAmt);
    }

    function copy ({value}) {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    return (
        <>
            <SearchBox>
                <Div>
                    <Div>
                        <Div>Manager 계좌 정보</Div>
                        <Div ml={5}>SwapManagerAccount : {swapManagerAccount}</Div>
                        <Div ml={5}>
                            <Flex>
                                <Div mr={10}>
                                    SwapManager ETH : <Span fg="blue">{ComUtil.toCurrency(swapManagerEth.toFixed(2))}</Span> <br/>
                                </Div>
                                <Div ml={20}>
                                    donmanager igas : <Span fg="blue">{ComUtil.toCurrency(managerIGas.toFixed(2))}</Span> <br/>
                                </Div>
                                <Div ml={20}>
                                    donmanager iram : <Span fg="blue">{ComUtil.toCurrency(managerIRam.toFixed(2))}</Span> <br/>
                                </Div>
                                <Div ml={20}>
                                    ethGasGwei : <Span fg="blue">{ComUtil.toCurrency(ethGasGwei.toFixed(2))}</Span>
                                </Div>
                            </Flex>
                        </Div>
                    </Div>
                    <Div my={10}>총 출금합계 : {total} {ercTokenName}</Div>
                    <Flex>
                        <Div mr={5}>
                            <Button loading={loading} onClick={search}>검색</Button>
                        </Div>
                    </Flex>
                </Div>


            </SearchBox>
            <Div m={10}>
                {/*<Flex bg={'white'} my={10} p={10}>*/}
                {/*<Div>test</Div>*/}
                {/*<Div>test</Div>*/}
                {/*<Div>test</Div>*/}
                {/*</Flex>*/}
                <Div className="ag-theme-balham" height={600} my={10}>
                    <AgGridReact
                        onGridReady={onGridReady}   //그리드 init(최초한번실행)
                        defaultColDef={defaultColDef}
                        gridOptions={gridOptions}
                        rowData={data}
                        rowHeight={35}
                        onCellDoubleClicked={copy}
                    >
                    </AgGridReact>
                </Div>
            </Div>
        </>
    )
}

export default IwWithdrawSwap;