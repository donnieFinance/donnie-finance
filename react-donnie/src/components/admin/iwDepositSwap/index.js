import React, { useState, useEffect } from 'react'
import {Div, Flex, Right, Span} from '~/styledComponents/shared'
import styled from 'styled-components'
import {color} from '~/styledComponents/Properties'
import {getValue} from "~/styledComponents/Util";
import {Button, Input} from 'antd'

import ComUtil from '~/util/ComUtil'

import {useRecoilState} from "recoil";
import {adminState} from "~/hooks/atomState";
import properties from "~/properties";

import useModal from '~/hooks/useModal'
import {AgGridReact} from 'ag-grid-react';

import AdminApi from '~/lib/adminApi'
import ApproveRenderer from './ApproveRenderer'

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

const IwblyDepositSwap = ({iwTokenName, ercTokenName}) => {

    // const iwTokenName = 'iwbly'; //중요: 통신용
    // const ercTokenName = 'BLY';  //display용 - 안중요.

    const [gridApi, setGridApi] = useState(null);

    const [iwTokenNm, setIwTokenNm] = useState(iwTokenName);
    const [ercTokenNm, setErcTokenNm] = useState(ercTokenName);

    // 관리자 로그인 정보
    const [adminLoginInfo, ] = useRecoilState(adminState);

    //모달
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal();

    // 로딩 표시
    const [loading, setLoading] = useState(true);

    const [swapManagerAccount, setSwapManagerAccount] = useState("");
    const [swapManagerEth, setSwapManagerEth] = useState(0);
    const [ethGasGwei, setEthGasGwei] = useState(0);
    const [managerIGas, setManagerIGas] = useState(0);
    const [managerIRam,setManagerIRam] = useState(0);

    // ERC입금 리스트
    const [data, setData] = useState([]);

    // 총 입금합계
    const [total, setTotal] = useState(0);

    const [iostabcContractUrl, setIostabcContractUrl] = useState("");

    const [depositIOSTAccountId, setDepositIOSTAccountId] = useState("");

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
                headerName: "No", field: "iwSwapDepositNo", width: 80
            },
            {
                headerName: "IRC계정", field: "ircAccount", width: 200, cellRenderer: 'ircAccountRenderer'
            },
            {
                headerName: "swap계정", field: "swapAccount", width: 200, cellRenderer: 'ethAccountRenderer'
            },
            {
                headerName: "입금erc"+ercTokenName, field: "ercTokenAmount", width: 100
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
                headerName: "approve상태", field: "approved", width: 300,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}), cellRenderer: "approveRenderer"
            },
            {
                headerName: "승인 완료시간", field: "approvedTime", width: 140,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params){
                    const v_Date = params.data.approvedTime ? ComUtil.utcToString(params.data.approvedTime, 'YYYY.MM.DD HH:mm') : null;
                    return v_Date;
                }
            },

            {
                headerName: "ircToken전송", field: "ircTokenPaid",
                cellRenderer: 'sudongSendRenderer'

            },
            {
                headerName: "ircToken전송시간", field: "ircTokenPaidTime", width: 150,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params){
                    const v_Date = params.data.ircTokenPaidTime ? ComUtil.utcToString(params.data.ircTokenPaidTime, 'YYYY.MM.DD HH:mm') : null;
                    return v_Date;
                }
            },
            {
                headerName: "eth 잔고", field: "ethBalance", width: 100,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}), cellRenderer: "ethBalanceRenderer"
            },
            {
                headerName: ercTokenName + " 잔고", field: "ercTokenBalance", cellRenderer: 'balanceCheckRenderer'
            }
        ],
        frameworkComponents: {
            ircAccountRenderer: ircAccountRenderer,
            approveRenderer: approveRenderer,
            ethAccountRenderer: ethAccountRenderer,
            balanceCheckRenderer: balanceCheckRenderer,
            sudongSendRenderer:sudongSendRenderer,
            //approveRenderer: ApproveRenderer,
            ethBalanceRenderer: ethBalanceRenderer
        }
    }

    useEffect(() => {
        search()
        getContractID()
        managerBalance()
        if(gridApi) {
            gridApi.setColumnDefs([]);
            gridApi.setColumnDefs(gridOptions.columnDefs);
        }
        setIwTokenNm(iwTokenName);
        setErcTokenNm(ercTokenName);
    }, [iwTokenName])

    function ircAccountRenderer({value, data:rowData}) {
        return (
            <div>
                <Span>
                    <Button size={'small'} type={'secondary'}
                            onClick={() => rowData.checkTotalSwapAmount()}> swap금액확인
                    </Button>
                </Span>
                <Span ml={10}>{rowData.ircAccount}</Span>
            </div>
        )
    }

    function approveRenderer({value, data:rowData}) {
        let status = '미승인';
        const managerStatus = rowData.approved;

        if (managerStatus === 0) {
            status = '0.미승인'
        } else if (managerStatus === 1) {
            status = '1.승인중'
        } else if (managerStatus === 2) {
            status = '2.승인완료'
        }

        return (
            managerStatus <= 1 ?
                <div>
                    {status}
                    <Span ml={10}>
                        <Button size={'small'} type={'primary'}
                                onClick={() => rowData.approveAllowanceClick()}> 조회
                        </Button>
                    </Span>
                    <Span ml={10}>
                        <Button size={'small'} type={'primary'}
                                onClick={() => rowData.manualApprove()}> 수동Approve
                        </Button>
                    </Span>
                    <Span ml={10}>
                        <Button size={'small'} type={'primary'}
                                onClick={() => rowData.transferOkClick()}> status2로변경.
                        </Button>
                    </Span>
                    <Span ml={10}>
                        <Button size={'small'} type={'primary'}
                                onClick={() => rowData.manualApproveCancelClick()}> 재Approve
                        </Button>
                    </Span>
                </div>
                :
                <div>
                    {status}
                    <Span ml={10}>
                        <Button size={'small'} type={'primary'}
                                onClick={() => rowData.approveAllowanceClick()}> Approve금액조회
                        </Button>
                    </Span>
                </div>
        )
    }

    function ethAccountRenderer ({value}) {
        let ethScanUrl = 'https://etherscan.io/address/';
        if(properties.isTestMode){
            ethScanUrl = 'https://ropsten.etherscan.io/address/';
        }
        return value && <><a href={`${ethScanUrl}${value}`} target={'_blank'} fg={'primary'} ml={10} ><u>EthScan</u></a> <span>{value}</span></>
    }

    function ethBalanceRenderer(props) {
        const rowData = props.data;
        // const onHandleClick = async() => {
        //     console.slog("eth don 잔액조회");
        //     let {data:result} = await AdminApi.sendWeiWithGasPrice(rowData.swapAccount);
        //     alert(result);
        // }
        const onRetrivalClick = async() => {
            console.slog("eth don 회수");
            let {data:result} = await AdminApi.iwErcAccountWeiRetrieval(iwTokenName, rowData.swapAccount);
            alert(result);
        }
        // let status = false;
        // if(rowData.managerTransfered === 1) {
        //     status = true;
        // }
        return(
            // status ?
            //     <div>
            //         {rowData.ethBalance}
            //         <Span ml={10}>
            //             <button onClick={onHandleClick}>fee수동전송</button>
            //         </Span>
            //     </div>
            //     :
                <div>
                    {rowData.ethBalance}
                    <Span ml={10}>
                        <button onClick={onRetrivalClick}>wei회수</button>
                    </Span>
                </div>
        )
    }

    function sudongSendRenderer(props) {
        const rowData = props.data;
        const onHandleClick = async() => {
            if(window.confirm(rowData.ircAccount+'의 '+ rowData.ercTokenAmount +'토큰을 수동전송 하시겠습니까?')) {
                const params = {
                    iwSwapDepositNo: rowData.iwSwapDepositNo,
                    iwTokenName: iwTokenName,
                    ircAccount: rowData.ircAccount,
                    ercTokenAmount: rowData.ercTokenAmount
                }
                //approve된 Iw ERC토큰 수동 전송 기능
                let {data: result} = await AdminApi.issueIwIrcToUser(params);
                alert(result);
                if (window.confirm('다시 재 검색하시겠습니까?')) {
                    search();
                }
            }
        }
        const onHandleComplateClick = async() => {
            if(window.confirm(rowData.ircAccount+'의 '+ rowData.ercTokenAmount +'토큰을 수동완료처리 하시겠습니까?')) {
                const params = {
                    iwSwapDepositNo: rowData.iwSwapDepositNo,
                    iwTokenName: iwTokenName,
                    ircAccount: rowData.ircAccount
                }
                //approve된 Iw ERC토큰 수동 전송 기능
                let {data: result} = await AdminApi.issueIwIrcToUserFinish(params);
                alert(result);
                if (window.confirm('다시 재 검색하시겠습니까?')) {
                    search();
                }
            }
        }
        let ircTokenPaidStat = 'false';
        if(rowData.ircTokenPaid){
            ircTokenPaidStat = 'true'
        }
        let v_memo = null;
        if(rowData.memo){
            v_memo = rowData.memo;
        }

        return(
            <div>
                {ircTokenPaidStat}
                {
                    !rowData.ircTokenPaid &&
                    <Span ml={5}>
                        <button onClick={onHandleClick}>수동전송</button>
                    </Span>
                }
                {
                    !rowData.ircTokenPaid &&
                    <Span ml={5}>
                        <button onClick={onHandleComplateClick}>수동완료</button>
                    </Span>
                }
                {v_memo}
            </div>
        )
    }

    function balanceCheckRenderer(props) {
        const rowData = props.data;
        const onHandleClick = async() => {
            let {data:result} = await AdminApi.getIwEthErcBalance(iwTokenName, rowData.swapAccount);
            alert(`${rowData.swapAccount} \n Eth: ${result[0]} \n ${ercTokenNm} 잔고: ${result[1]}`);
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


    async function managerBalance() {

        // console.log(properties.address.don.tokenName);
        // let {data:managerIrcDon} = await AdminApi.getBalanceOfManagerIrc();
        // setManagerIrcDon(managerIrcDon);

        const {data:swapManagerEth} = await AdminApi.getManagerEthBalance();
        setSwapManagerEth(swapManagerEth);

        // let {data:swapManagerDon} = await AdminApi.getManagerDonBalance();
        // setSwapManagerDon(swapManagerDon);

        const {data:managerIgas} = await AdminApi.getDonManagerIGas(); //iw토큰들은 donswap아닌 donmanager 이용.
        setManagerIGas(managerIgas);

        const {data:managerIram} = await AdminApi.getDonManagerIRam(); //iw토큰들은 donswap아닌 donmanager 이용.
        setManagerIRam(managerIram);

        const {data:swapManagerAccount} = await AdminApi.getSwapManagerAccount(); //erc SwapManager
        setSwapManagerAccount(swapManagerAccount);

        const {data:ethGasGwei} = await AdminApi.getEthGasGwei();
        setEthGasGwei(ethGasGwei);
    }

    async function getContractID() {
        const {data} = await AdminApi.getIwTokenContractId(iwTokenName);
        const url = "https://www.iostabc.com/contract/" + data;
        setIostabcContractUrl(url);
    }

    async function search() {
        setLoading(true);
        const {data} = await AdminApi.iwErcDepositSwap(iwTokenName, false, false);

        data.map(item => {
            item.ercTokenAmount = parseFloat(item.ercTokenAmount)
        })

        if(data) {
            data.map(item => {
                item.iwTokenName = iwTokenName
                item.approveAllowanceClick = function () {
                    userApproveAmt(iwTokenName, item);
                }
                item.checkTotalSwapAmount = function () {
                    checkTotalSwap(iwTokenName, item);
                }
                item.manualApprove = function () {
                    manualErcApprove(iwTokenName, item);
                }
                item.manualApproveCancelClick = function () {
                    const vNonce = window.prompt("Nonce를 입력해주세요")
                    if (!vNonce) {
                        return
                    }
                    if(window.confirm("재Approve 하시겠습니까? 가스를 49000*GWEI충분히 넣고해주세요.")) {
                        approveErcCancelManually(iwTokenName, item, vNonce);
                    }
                }
                item.transferOkClick = function () {
                    userApproveOk(iwTokenName, item);
                }
            })
        }

        setData(data);
        let totalDeposit = 0;
        if(data) {
            data.map(item => {
                totalDeposit = totalDeposit + parseFloat(item.ercTokenAmount);
                // console.log(item);
            })
            totalDeposit = totalDeposit.toFixed(8);
        }
        setTotal(totalDeposit);
        setLoading(false);
    }

    async function userApproveOk(iwTokenName, item) {
        const {data:result} = await AdminApi.updateUserApproveOk(iwTokenName, item.iwSwapDepositNo);
        if(result === 200) {
            alert("변경이 완료되었습니다.");
            search();
        }
    }

    async function userApproveAmt(iwTokenName, item) {
        const {data:approveAmt} = await AdminApi.getIwErcTokenApproved(iwTokenName, item.ircAccount);
        alert("Approve:"+approveAmt);
    }

    async function checkTotalSwap(iwTokenName, item) {
        const {data:result} = await AdminApi.getIwSwapTotalAmount(iwTokenName, item.ircAccount);
        // console.log(result);
        let resultText = result.ircAccount + "\n" + result.iwTokenName
            + "\ntotalDeposit : " + result.totalDeposit
            + "\ntotalWithdraw : " + result.totalWithdraw
            + "\ntotalFee : " + result.totalFee
            + "\navailableWithdraw : " + result.availableWithdraw;
        alert(resultText);
    }

    //20210407 추가.
    async function manualErcApprove(iwTokenName, item) {
        console.slog("수동 approve 요청");
        const {data:approveResult} = await AdminApi.manualErcApprove(iwTokenName, item.iwSwapDepositNo);
        console.slog({approveResult});
        alert("Approve Result:"+approveResult);
    }

    //20210524 추가.
    async function approveErcCancelManually(iwTokenName, item, nonce) {
        console.slog("수동 approveErcCancelManually 요청");
        const {data:approveResult} = await AdminApi.approveErcCancelManually(iwTokenName, item.iwSwapDepositNo, nonce);
        console.slog({approveResult});
        alert("ApproveErcCancelManually Result:"+approveResult);
    }

    async function searchWithEth() {
        setLoading(true);
        const {data} = await AdminApi.iwErcDepositSwap(iwTokenName, true, false);
        setData(data);
        setLoading(false);
    }

    async function searchWithErc() {
        setLoading(true);
        const {data} = await AdminApi.iwErcDepositSwap(iwTokenName,true, true);
        setData(data);
        setLoading(false);
    }

    function copy ({value}) {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    const onDepositChangeIOSTAccountId = ({target}) => {
        const {name, value} = target
        setDepositIOSTAccountId(value);
    }
    async function onApproveManual() {
        if(window.confirm("계정:"+depositIOSTAccountId+" "+iwTokenName+"토큰 수동전송하시겠습니까?")) {
            console.log(depositIOSTAccountId, iwTokenName);
            const {data} = await AdminApi.manualApprove0x34(iwTokenName, depositIOSTAccountId);
            alert(data);
        }
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
                                SwapManager ETH : <Span fg="blue">{ComUtil.toCurrency(swapManagerEth && swapManagerEth.toFixed(2))}</Span> <br/>
                            </Div>
                            <Div ml={20}>
                                donmanager igas : <Span fg="blue">{ComUtil.toCurrency(managerIGas && managerIGas.toFixed(2))}</Span> <br/>
                            </Div>
                            <Div ml={20}>
                                donmanager iram : <Span fg="blue">{ComUtil.toCurrency(managerIRam && managerIRam.toFixed(2))}</Span> <br/>
                            </Div>
                            <Div ml={20}>
                                ethGasGwei : <Span fg="blue">{ComUtil.toCurrency(ethGasGwei && ethGasGwei.toFixed(2))}</Span>
                            </Div>
                        </Flex>
                    </Div>
                </Div>
                <Flex>
                    <Div my={10}>총 입금합계 : {total} {ercTokenName}</Div>
                    <Div my={10} ml={20}><a href={`${iostabcContractUrl}`} target={'_blank'} fg={'primary'}>GO iostabc tokenContract</a></Div>
                </Flex>
                <Flex>
                    <Div mr={5}>
                        <Button loading={loading} onClick={searchWithEth}>Eth 잔고출력</Button>
                    </Div>
                    <Div>
                        <Button loading={loading} onClick={searchWithErc}>Eth, {ercTokenName} 잔고출력</Button>
                    </Div>
                    {/*<Right> 38계좌 해킹 장애복구용 */}
                    {/*    <Flex>*/}
                    {/*        <Div mr={15}>*/}
                    {/*            <Input style={{fontSize:14.7}} size={'large'} placeHolder={'IOST Account ID'} onChange={onDepositChangeIOSTAccountId} value={depositIOSTAccountId}/>*/}
                    {/*        </Div>*/}
                    {/*        <Button onClick={onApproveManual}>수동Approve(0x34)</Button>*/}
                    {/*    </Flex>*/}
                    {/*</Right>*/}
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
export default IwblyDepositSwap;