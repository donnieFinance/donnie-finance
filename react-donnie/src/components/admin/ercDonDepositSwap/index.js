import React, { useState, useEffect } from 'react'
import {Div, Flex, Span} from '~/styledComponents/shared'
import styled from 'styled-components'
import {color} from '~/styledComponents/Properties'
import {getValue} from "~/styledComponents/Util";
import {Button} from 'antd'

import ComUtil from '~/util/ComUtil'

import {useRecoilState} from "recoil";
import {adminState} from "~/hooks/atomState";
import properties from "~/properties";

import useModal from '~/hooks/useModal'
import {AgGridReact} from 'ag-grid-react';

import AdminApi from '~/lib/adminApi'

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

const ErcDonDepositSwap = (props) => {

    // 관리자 로그인 정보
    const [adminLoginInfo, ] = useRecoilState(adminState);

    //모달
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal();

    // 로딩 표시
    const [loading, setLoading] = useState(true);

    // ERC입금 리스트
    const [data, setData] = useState([]);

    // 총 입금합계
    const [total, setTotal] = useState(0);
    const [swapManagerEth, setSwapManagerEth] = useState(0);
    const [swapManagerDon, setSwapManagerDon] = useState(0);
    const [ethGasGwei, setEthGasGwei] = useState(0);
    const [managerIGas, setManagerIGas] = useState(0);
    const [managerIRam, setManagerIRam] = useState(0);
    const [managerIrcDon, setManagerIrcDon] = useState(0);
    const [swapManagerAccount, setSwapManagerAccount] = useState("");

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
                headerName: "No", field: "swapErcToIrcNo", width: 80
            },
            {
                headerName: "irc계정", field: "ircAccount", width: 120
            },
            {
                headerName: "swap계정", field: "swapAccount", width: 300, cellRenderer: 'ethAccountRenderer'
            },
            {
                headerName: "입금ercDon", field: "ercTokenAmount", width: 140
            },
            {
                headerName: "swap 시작시간", field: "recordCreateTime", width: 140,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params){
                    const v_Date = params.data.recordCreateTime ? ComUtil.utcToString(params.data.recordCreateTime, 'YYYY.MM.DD HH:mm') : null;
                    return v_Date;
                }
            },
            {
                headerName: "manager전송", field: "managerTransfered", width: 170,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}), cellRenderer: "managerTransferRenderer"
            },
            {
                headerName: "manager 전송시간", field: "managerTransferedTime", width: 160,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params){
                    const v_Date = params.data.managerTransferedTime ? ComUtil.utcToString(params.data.managerTransferedTime, 'YYYY.MM.DD HH:mm') : null;
                    return v_Date;
                }
            },
            {
                headerName: "ircDon전송", field: "ircTokenPaid", width: 110, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
            },
            {
                headerName: "swap 완료시간", field: "ircTokenPaidTime", width: 140,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params){
                    const v_Date = params.data.ircTokenPaidTime ? ComUtil.utcToString(params.data.ircTokenPaidTime, 'YYYY.MM.DD HH:mm') : null;
                    return v_Date;
                }
            },
            {
                headerName: "eth 잔고", field: "ethBalance", width: 120,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}), cellRenderer: "ethBalanceRenderer"
            },
            {
                headerName: "don 잔고", field: "ercTokenBalance",
                cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                width: 120, cellRenderer: 'balanceCheckRenderer'
            }
        ],
        frameworkComponents: {
            ethAccountRenderer: ethAccountRenderer,
            managerTransferRenderer: managerTransferRenderer,
            balanceCheckRenderer: balanceCheckRenderer,
            ethBalanceRenderer: ethBalanceRenderer
        }
    }

    function ethAccountRenderer ({value}) {
        let ethScanUrl = 'https://etherscan.io/address/';
        const mainnetEthScanUrl = 'https://etherscan.io/address/'
        const ropstenEthScanUrl = 'https://ropsten.etherscan.io/address/'
        if(properties.isTestMode){
            ethScanUrl = ropstenEthScanUrl;
        }
        return value && <><a href={`${ethScanUrl}${value}`} target={'_blank'} fg={'primary'} ml={10} ><u>EthScan</u></a> <span>{value}</span></>
    }

    function managerTransferRenderer({value, data:rowData}) {
        let status = '요청';
        const managerStatus = rowData.managerTransfered;

        if(managerStatus === 0) {
            status = '요청'
        } else if(managerStatus === 1) {
            status = '전송중'
        } else if(managerStatus === 2) {
            status = '전송완료'
        }

        return(
            managerStatus === 1 ?
                <div>
                    {status}
                    <Span ml={10}>
                        <Button size={'small'} type={'primary'}
                            onClick={() => rowData.transferOkClick()}> 완료처리
                        </Button>
                    </Span>
                </div>
            :
                <div>{status}</div>
        )
    }

    function ethBalanceRenderer(props) {
        const rowData = props.data;
        const onHandleClick = async() => {
            console.slog("eth don 잔액조회");
            let {data:result} = await AdminApi.sendWeiWithGasPrice(rowData.swapAccount);
            alert(result);
        }
        const onRetrivalClick = async() => {
            console.slog("eth don 회수");
            let {data:result} = await AdminApi.donErcAccountWeiRetrieval(rowData.swapAccount);
            alert(result);
        }
        let status = false;
        if(rowData.managerTransfered === 1) {
            status = true;
        }
        return(
            status ?
                <div>
                    {rowData.ethBalance}
                    <Span ml={10}>
                        <button onClick={onHandleClick}>fee수동전송</button>
                    </Span>
                </div>
                :
                <div>
                    {rowData.ethBalance}
                    <Span ml={10}>
                        <button onClick={onRetrivalClick}>wei회수</button>
                    </Span>
                </div>
        )
    }

    function balanceCheckRenderer(props) {
        const rowData = props.data;
        const onHandleClick = async() => {
            console.slog("eth don 잔액조회");
            let {data:result} = await AdminApi.getEthErcBalance(rowData.swapAccount);
            alert(rowData.swapAccount + "\nEth: " + result[0] + "\nDon: " + result[1]);
        }

        return(
            <div>
                {rowData.ercTokenBalance}
                <Span ml={10}>
                    <button onClick={onHandleClick}>잔액조회</button>
                </Span>
            </div>
        )
    }

    useEffect(() => {
        search()
        managerBalance()
    }, [])

    async function managerBalance() {

        // console.log(properties.address.don.tokenName);
        const {data:managerIrcDon} = await AdminApi.getBalanceOfManagerIrc();
        setManagerIrcDon(managerIrcDon);

        const {data:swapManagerEth} = await AdminApi.getManagerEthBalance();
        setSwapManagerEth(swapManagerEth);

        const {data:swapManagerDon} = await AdminApi.getManagerDonBalance();
        setSwapManagerDon(swapManagerDon);

        const {data:managerIgas} = await AdminApi.getManagerIGas();
        setManagerIGas(managerIgas);

        const {data:managerIram} = await AdminApi.getManagerIRam();
        setManagerIRam(managerIram);

        const {data:swapManagerAccount} = await AdminApi.getSwapManagerAccount();
        setSwapManagerAccount(swapManagerAccount);

        const {data:ethGasGwei} = await AdminApi.getEthGasGwei();
        setEthGasGwei(ethGasGwei);

    }

    async function search() {
        setLoading(true);
        const {data} = await AdminApi.ercDonDepositSwap(false, false);

        data.map(item => item.transferOkClick = function() {
            managerTransferOk(item);
        })

        setData(data);
        let totalDeposit = 0;
        data.map(item => {
            totalDeposit = totalDeposit + parseFloat(item.ercTokenAmount);
          // console.log(item);
        })
        setTotal(totalDeposit);
        setLoading(false);
    }

    async function managerTransferOk(item) {
        const {data:result} = await AdminApi.updateErcSwapFinished(item.swapErcToIrcNo);
        if(result === 200) {
            alert("변경이 완료되었습니다.");
            search();
        }
    }

    async function searchWithEth() {
        setLoading(true);
        const {data} = await AdminApi.ercDonDepositSwap(true, false);
        setData(data);
        setLoading(false);
    }

    async function searchWithDon() {
        setLoading(true);
        const {data} = await AdminApi.ercDonDepositSwap(true,true);
        setData(data);
        setLoading(false);
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
                    <Div ml={10}>SwapManagerAccount : {swapManagerAccount}</Div>
                    <Div>
                        <Flex ml={10}>
                            <Div mr={10}>
                                SwapManager ETH : <Span fg="blue">{ComUtil.toCurrency(swapManagerEth.toFixed(2))}</Span> <br/>
                                SwapManager DON : <Span fg="blue">{ComUtil.toCurrency(swapManagerDon.toFixed(0))} </Span> <br/>
                            </Div>
                            <Div ml={20}>
                                donswap igas : <Span fg="blue">{ComUtil.toCurrency(managerIGas.toFixed(2))}</Span> <br/>
                                donswap Don : <Span fg="blue">{ComUtil.toCurrency(managerIrcDon.toFixed(2))} </Span> <br/>
                            </Div>
                            <Div ml={20}>
                                ethGasGwei : <Span fg="blue">{ComUtil.toCurrency(ethGasGwei.toFixed(2))}</Span> <br/>
                                donswap iram : <Span fg="blue">{ComUtil.toCurrency(managerIRam.toFixed(2))}</Span> <br/>
                            </Div>
                        </Flex>
                    </Div>
                </Div>
                <Div my={10}>총 입금합계 : {total} DON</Div>
                <Flex>
                    <Div mr={5}>
                        <Button loading={loading} onClick={searchWithEth}>Eth 잔고출력</Button>
                    </Div>
                    <Div>
                        <Button loading={loading} onClick={searchWithDon}>Eth, Don 잔고출력</Button>
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
                    defaultColDef={defaultColDef}
                    gridOptions={gridOptions}
                    rowData={data}
                    onCellDoubleClicked={copy}
                >
                </AgGridReact>
            </Div>
        </Div>
        </>
    )
}
export default ErcDonDepositSwap;