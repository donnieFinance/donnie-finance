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

const ErcDonWithdrawSwap = (props) => {

    // 관리자 로그인 정보
    const [adminLoginInfo, ] = useRecoilState(adminState);

    const [gridApi, setGridApi] = useState(null);

    // 로딩 표시
    const [donManagerLoading, setDonManagerLoading] = useState(true);
    const [loading, setLoading] = useState(true);

    //모달
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal();

    // 스왑매니저 정보, Eth 및 Gas 정보
    const [swapManagerEth, setSwapManagerEth] = useState(0);
    const [swapManagerDon, setSwapManagerDon] = useState(0);
    const [ethGasGwei, setEthGasGwei] = useState(0);
    const [managerIGas, setManagerIGas] = useState(0);
    const [managerIRam, setManagerIRam] = useState(0);
    const [managerIrcDon, setManagerIrcDon] = useState(0);
    const [swapManagerAccount, setSwapManagerAccount] = useState("");

    // ERC출금 리스트
    const [data, setData] = useState([]);

    // 총 출금합계
    const [total, setTotal] = useState(0);
    const [withdrawSequence, setWithdrawSequence] = useState(0);

    // 수동 erc 출금
    const [manualWithdrawSeq, setWithdrawSeq] = useState(0);

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
                headerName: "DON ERC출금 계정", field: "ercAccount", width: 150, cellRenderer: 'donAccountRenderer'
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
        frameworkComponents: {
            donAccountRenderer: donAccountRenderer,
            ircStatusRenderer: ircStatusRenderer,
            sudongSendRenderer:sudongSendRenderer
        }
    }

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
    };

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    useEffect(() => {
        search();
        managerBalance();
    }, [])

    function donAccountRenderer ({value}) {
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
            if(window.confirm('DON토큰을 수동전송 하시겠습니까?')) {
                const params = {
                    withdrawSeq: rowData.withdrawSeq,
                    receiverAddr: rowData.ercAccount,
                    tokenAmount: rowData.ercWithdrawAmount
                }
                //Don ERC토큰 수동 전송 기능
                let {data: result} = await AdminApi.sendUserErcDonToExtAccount(params);
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
    async function managerBalance() {

        setDonManagerLoading(true);

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

        setDonManagerLoading(false);
    }

    async function search() {
        setLoading(true);

        const {data:sequence} = await AdminApi.getErcDonMaxWithdrawSequence()
        setWithdrawSequence(sequence);

        const {data} = await AdminApi.ercDonWidthdrawSwap();
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
    }

    function copy ({value}) {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    const onChangeWithdrawSeq = ({target}) => {
        const {name, value} = target
        setWithdrawSeq(value);
    }

    async function onWithdrawManual() {
        const {data:resultStr} = await AdminApi.sendUserErcDonToExtAccountManual(manualWithdrawSeq);
        alert(resultStr);
    }

    return (
        <>
        <SearchBox>
            <Div>
                <Div>
                    <Div>Manager 계좌 정보 <Button loading={donManagerLoading} onClick={managerBalance}>Don Manager 검색</Button></Div>
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
                <Div my={10}>총 출금합계 : {total} DON</Div>
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
                    onGridReady={onGridReady}   //그리드 init(최초한번실행)
                    defaultColDef={defaultColDef}
                    gridOptions={gridOptions}
                    rowData={data}
                    rowHeight={35}
                    onCellDoubleClicked={copy}>
                </AgGridReact>
            </Div>
        </Div>
        </>
    )
}
export default ErcDonWithdrawSwap;