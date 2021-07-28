import React, { useState, useEffect } from 'react'
import {Div, Flex, Right, Span} from '~/styledComponents/shared'
import styled from 'styled-components'
import {color} from '~/styledComponents/Properties'
import {getValue} from "~/styledComponents/Util";
import {Button, Input} from 'antd'

import ComUtil from '~/util/ComUtil'

import {useRecoilState} from "recoil";
import {adminState} from "~/hooks/atomState";

import useModal from '~/hooks/useModal'
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

const IdoErcWithdrawSwap = ({iwTokenName, ercTokenName}) => {

    // const iwTokenName = 'iwwitch'; //중요: 통신용 //TODO 이변수 사용해서 전면 수정
    // const ercTokenName = 'WITCH';  //display용 - 안중요.

    // 관리자 로그인 정보
    const [adminLoginInfo, ] = useRecoilState(adminState);

    const [gridApi, setGridApi] = useState(null);

    // 로딩 표시
    const [donManagerLoading, setDonManagerLoading] = useState(true);
    const [loading, setLoading] = useState(true);

    //모달
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal();

    const [swapManagerAccount, setSwapManagerAccount] = useState("");

    const [swapManagerEth, setSwapManagerEth] = useState(0);
    const [ethGasGwei, setEthGasGwei] = useState(0);

    const [managerIGas, setManagerIGas] = useState(0);
    const [managerIRam, setManagerIRam] = useState(0);
    /*
    // [0] manager 보유금: (고객예치금 포함)
    // [1] 고객예치금.
    // [2] 고객 총입금
    // [3] 고객 총출금
    */
    const [managerBalance, setManagerBalance] = useState({
        managerBalance:0,
        consumerBalance:0,
        consumerTotalDeposit:0,
        consumerTotalWithdraw:0
    });

    // ERC출금 리스트
    const [data, setData] = useState([]);

    // 총 출금합계
    const [total, setTotal] = useState(0);
    const [withdrawSequence, setWithdrawSequence] = useState(0);

    // 수동 erc 출금
    const [manualWithdrawSeq, setWithdrawSeq] = useState(0);

    //ag-grid 옵션
    const gridOptions = {
        defaultColDef:{
            filter: true,
            resizable: true,
            sortable: true,
            floatingFilter: false,
            filterParams: {
                newRowsAction: 'keep'
            }
        },
        rowHeight:35,
        columnDefs: [
            {
                headerName: "No", field: "withdrawSeq", width: 80
            },
            {
                headerName: "IRC계정", field: "ircAccount", width: 100
            },
            {
                headerName: "IRC 출금요청시간", field: "requestTime",
                width: 130,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                valueGetter: function(params){
                    return params.data.requestTime ? ComUtil.utcUnixToString(params.data.requestTime, "YYYY.MM.DD HH:mm") : null;
                }
            },
            {
                headerName: "IRC 요청토큰", field: "amount", width: 120
            },
            {
                headerName: "IRC Status", field: "status", width: 120, cellRenderer: 'ircStatusRenderer'
            },

            {
                headerName: "ERC 출금토큰", field: "ercWithdrawAmount", width: 120
            },
            {
                headerName: ercTokenName+ " ERC출금 계정", field: "ercAccount", width: 150, cellRenderer: 'ercAccountRenderer'
            },
            {
                headerName: "ERC 요청시간", field: "ercRequestTime",
                width: 130,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                valueGetter: function(params){
                    return params.data.ercRequestTime ? ComUtil.utcToString(params.data.ercRequestTime, 'YYYY.MM.DD HH:mm') : null;
                }
            },
            {
                headerName: "ERC 전송완료시간", field: "ercDoneTime",
                width: 130,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                valueGetter: function(params){
                    return params.data.ercDoneTime ? ComUtil.utcToString(params.data.ercDoneTime, 'YYYY.MM.DD HH:mm') : null;
                }
            },
            {
                headerName: "ERC Status", field: "ercStatus", width: 200,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                cellRenderer: 'sudongSendRenderer'
            },
            {
                headerName: "ERC txHash", field: "ercTxHash", width: 200
            }

        ],
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        frameworkComponents: {
            ercAccountRenderer: ercAccountRenderer,
            ircStatusRenderer: ircStatusRenderer,
            sudongSendRenderer:sudongSendRenderer
        },
        onGridReady: onGridReady
    }

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    function onGridReady(params){
        setGridApi(params.api);
    };

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    useEffect(() => {
        search();
        getManagerBalance();
    }, [])

    function ercAccountRenderer ({value}) {
        let ethScanUrl = 'https://etherscan.io/address/';
        if(properties.isTestMode){
            ethScanUrl = 'https://ropsten.etherscan.io/address/'
        }
        return value && <><a href={`${ethScanUrl}${value}`} target={'_blank'} fg={'primary'} ml={10} ><u>EthScan</u></a> <span>{value}</span></>
    }
    const getIrcStatus = (statusCode) => {
        let status = '요청';
        //irc 0:request, 1:inProcess: 2:done
        const ircStatus = parseInt(statusCode);

        if(ircStatus === 0) status = '요청'
        else if(ircStatus === 1) status = '전송중'
        else if(ircStatus === 2) status = '전송완료'
        return status;
    }
    function ircStatusRenderer({value, data:rowData}) {
        return getIrcStatus(rowData.status);
    }
    function sudongSendRenderer(props) {
        const rowData = props.data;
        const onHandleClick = async() => {
            if(window.confirm(ercTokenName + ' 토큰을 수동전송 하시겠습니까? (다소 위험합니다.)')) {
                const params = {
                    iwTokenName: iwTokenName,
                    withdrawSeq: rowData.withdrawSeq,
                    receiverAddr: rowData.ercAccount,
                    tokenAmount: rowData.ercWithdrawAmount
                }
                //ERC토큰 수동 전송 기능
                let {data: result} = await AdminApi.sendUserIdoErcToExtAccount(params);
                alert(result);
                if (window.confirm('다시 재 검색하시겠습니까?')) {
                    search();
                }
            }
        }
        const donStatus = rowData.ercStatus;
        const statusNM = getIrcStatus(donStatus);
        return(
            <div>
                {statusNM}
                {
                    donStatus < 2 &&
                    <Span ml={10}>
                        <button onClick={onHandleClick}>수동전송</button>
                    </Span>
                }
            </div>
        )
    }
    async function getManagerBalance() {

        setDonManagerLoading(true);

        const {data:swapManagerAccount} = await AdminApi.getSwapManagerAccount();
        setSwapManagerAccount(swapManagerAccount);

        // IDO SwapManager Balance
        // [0] manager 보유금: (고객예치금 포함)
        // [1] 고객예치금.
        // [2] 고객 총입금
        // [3] 고객 총출금
        const {data:managerBalanceData} = await AdminApi.getIdoManagerBalance(iwTokenName);
        if(managerBalanceData) {
            setManagerBalance({
                managerBalance:managerBalanceData[0],
                consumerBalance:managerBalanceData[1],
                consumerTotalDeposit:managerBalanceData[2],
                consumerTotalWithdraw:managerBalanceData[3]
            });
        }

        const {data:swapManagerEth} = await AdminApi.getManagerEthBalance();
        setSwapManagerEth(swapManagerEth);

        const {data:ethGasGwei} = await AdminApi.getEthGasGwei();
        setEthGasGwei(ethGasGwei);

        const {data:managerIgas} = await AdminApi.getDonManagerIGas(); //iw토큰들은 donswap아닌 donmanager 이용.
        setManagerIGas(managerIgas);

        const {data:managerIram} = await AdminApi.getDonManagerIRam(); //iw토큰들은 donswap아닌 donmanager 이용.
        setManagerIRam(managerIram);


        setDonManagerLoading(false);
    }

    const search = async () => {
        setLoading(true);
        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }

        const {data:sequence} = await AdminApi.getIwMaxWithdrawSequence(iwTokenName)
        setWithdrawSequence(sequence);

        const {data} = await AdminApi.idoErcWidthdrawSwap(iwTokenName);
        setData(data);

        let totalWithdraw = 0;
        if(data) {
            data.map(item => {
                totalWithdraw = totalWithdraw + parseFloat(item.amount);
                // console.log(item);
            })
        }
        totalWithdraw = totalWithdraw.toFixed(8);
        setTotal(totalWithdraw);

        setLoading(false);
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()
        }
    }

    function copy ({value}) {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    const onChangeWithdrawSeq = ({target}) => {
        const {name, value} = target
        setWithdrawSeq(value);
    }

    async function onWithdrawManual() {
        const {data:resultStr} = await AdminApi.sendUserIdoErcToExtAccountManual(iwTokenName, manualWithdrawSeq);
        alert(resultStr);
    }

    return (
        <>
        <SearchBox>
            <Div>
                <Div>
                    <Div>Manager 계좌 정보 <Button loading={donManagerLoading} onClick={getManagerBalance}>Manager 검색</Button></Div>
                    <Div ml={10}>SwapManagerAccount : {swapManagerAccount}</Div>
                    <Div ml={10}>
                        <Flex>
                            <Div mr={10}>
                                SwapManager {ercTokenName} : <Span fg="blue">{ComUtil.toCurrency(managerBalance.managerBalance)} </Span>
                            </Div>
                            <Div ml={20}>
                                고객예치금 : <Span fg="blue">{ComUtil.toCurrency(managerBalance.consumerBalance)}</Span>
                            </Div>
                            <Div ml={20}>
                                고객 총입금 : <Span fg="blue">{ComUtil.toCurrency(managerBalance.consumerTotalDeposit)}</Span>
                            </Div>
                            <Div ml={20}>
                                고객 총출금 : <Span fg="blue">{ComUtil.toCurrency(managerBalance.consumerTotalWithdraw)}</Span>
                            </Div>
                        </Flex>
                    </Div>
                    <Div>
                        <Flex ml={10}>
                            <Div mr={10}>
                                SwapManager ETH : <Span fg="blue">{ComUtil.toCurrency(swapManagerEth && swapManagerEth.toFixed(2))}</Span>
                            </Div>
                            <Div mr={10}>
                                ETH Gas Gwei : <Span fg="blue">{ComUtil.toCurrency(ethGasGwei && ethGasGwei.toFixed(2))}</Span>
                            </Div>
                            <Div mr={10}>

                            </Div>
                        </Flex>
                    </Div>
                    <Div>
                        <Flex ml={10}>
                            <Div mr={10}>
                                DonManager IGas : <Span fg="blue">{ComUtil.toCurrency(managerIGas && managerIGas.toFixed(2))}</Span>
                            </Div>
                            <Div mr={10}>
                                DonManager IRam : <Span fg="blue">{ComUtil.toCurrency(managerIRam && managerIRam.toFixed(2))}</Span>
                            </Div>
                        </Flex>
                    </Div>
                </Div>
                <Div my={10}>총 출금합계 : {total} {ercTokenName}</Div>
                <Flex>
                    <Div mr={5}>
                        <Button loading={loading} onClick={search}>검색</Button>
                    </Div>
                    <Right>
                        <Flex>
                            <Div mr={15}>
                                withdrawSequence : {withdrawSequence}
                            </Div>
                            <Div mr={5}>
                                <Input style={{fontSize:14.7}} size={'large'} onChange={onChangeWithdrawSeq} value={manualWithdrawSeq}/>
                            </Div>
                            <Button onClick={onWithdrawManual}>수동erc송금</Button>
                        </Flex>
                    </Right>
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
                    gridOptions={gridOptions}
                    rowData={data}
                    onCellDoubleClicked={copy}>
                </AgGridReact>
            </Div>
        </Div>
        </>
    )
}
export default IdoErcWithdrawSwap;