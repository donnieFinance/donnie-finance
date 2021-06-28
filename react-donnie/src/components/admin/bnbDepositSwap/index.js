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

const BnbDepositSwap = () => {

    // const iwTokenName = "iwBNB";
    const iwTokenName = "iwbnb";
    const bepTokenName = "BNB";

    const [gridApi, setGridApi] = useState(null);

    // 관리자 로그인 정보
    const [adminLoginInfo, ] = useRecoilState(adminState);

    //모달
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal();

    // 로딩 표시
    const [bnbManagerLoading, setBnbManagerLoading] = useState(true);
    const [loading, setLoading] = useState(true);


    const [bnbManagerAccount, setBnbManagerAccount] = useState("");
    /*
    // [0] manager 실 보유: (고객예치금 제외)
    // [1] manager 보유금: (고객예치금 포함)
    // [2] 고객예치금.
    // [3] 고객 총입금
    // [4] 고객 총출금
    */
    const [bnbManagerBalance, setBnbManagerBalance] = useState({
        managerRealBalance:0,
        managerBalance:0,
        consumerBalance:0,
        consumerTotalDeposit:0,
        consumerTotalWithdraw:0
    });
    const [bnbGasPrice, setBnbGasPrice] = useState(0);

    const [ethGasGwei, setEthGasGwei] = useState(0);
    const [managerIGas, setManagerIGas] = useState(0);
    const [managerIRam,setManagerIRam] = useState(0);

    // BEP입금 리스트
    const [data, setData] = useState([]);

    // 총 입금합계
    const [total, setTotal] = useState(0);

    const [iostabcContractUrl, setIostabcContractUrl] = useState("");

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
                headerName: "No", field: "swapBnbNo", width: 80
            },
            {
                headerName: "irc계정", field: "ircAccount", width: 200, cellRenderer: 'ircAccountRenderer'
            },
            {
                headerName: "swap계정(BEP)", field: "swapAccount", width: 200, cellRenderer: 'bepAccountRenderer'
            },
            {
                headerName: "입금BNB", field: "bnbTokenAmount", width: 140
            },
            {
                headerName: "BNBGas", field: "bnbGasWei", width: 120,
                valueGetter: function(params){
                    return params.data.bnbGasWei ? parseFloat(params.data.bnbGasWei, 'YYYY.MM.DD HH:mm') : null;
                }
            },
            {
                headerName: "swap 시작시간", field: "recordCreateTime", width: 130,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params){
                    const v_Date = params.data.recordCreateTime ? ComUtil.utcToString(params.data.recordCreateTime, 'YYYY.MM.DD HH:mm') : null;
                    return v_Date;
                }
            },
            {
                headerName: "manager전송", field: "managerTransfered", width: 300,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}), cellRenderer: 'managerTransferRenderer'
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
                headerName: "irc전송여부", field: "ircTokenPaid", cellRenderer: 'sudongSendRenderer'
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
                headerName: "BNB 잔고", field: "bnbTokenBalance",
                cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                width: 120, cellRenderer: 'balanceCheckRenderer'
            }
            // {
            //     headerName: bnbTokenName + " 잔고", field: "bnbTokenBalance", width: 150, cellRenderer: 'balanceCheckRenderer'
            // }
        ],
        frameworkComponents: {
            // approveRenderer: approveRenderer,
            ircAccountRenderer: ircAccountRenderer,
            bepAccountRenderer: bepAccountRenderer,
            managerTransferRenderer: managerTransferRenderer,
            balanceCheckRenderer: balanceCheckRenderer,
            sudongSendRenderer:sudongSendRenderer,
        }
    }

    useEffect(() => {
        search();
        getContractID();
        managerBalance();
        if(gridApi) {
            gridApi.setColumnDefs([]);
            gridApi.setColumnDefs(gridOptions.columnDefs);
        }
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

    function managerTransferRenderer({value, data:rowData}) {
        let status = '요청';
        const managerStatus = rowData.managerTransfered;

        console.log("managerStatus",managerStatus)
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
                                onClick={() => rowData.manualSend()}> 수동전송
                        </Button>
                    </Span>
                    <Span ml={10}>
                        <Button size={'small'} type={'primary'}
                                onClick={() => rowData.transferOkClick()}> 완료처리(status=2)
                        </Button>
                    </Span>
                </div>
                :
                <div>{status}</div>
        )
    }

    function bepAccountRenderer ({value}) {
        let bscScanUrl = 'https://bscscan.com/address/';
        if(properties.isTestMode){
            bscScanUrl = 'https://testnet.bscscan.com/address/';
        }
        return value && <><a href={`${bscScanUrl}${value}`} target={'_blank'} fg={'primary'} ml={10} ><u>BscScan</u></a> <span>{value}</span></>
    }

    function sudongSendRenderer(props) {
        const rowData = props.data;
        const onHandleClick = async() => {
            if(window.confirm(rowData.ircAccount+'의 '+ rowData.bnbTokenAmount +'토큰을 수동전송 하시겠습니까?')) {
                const params = {
                    iwSwapDepositNo: rowData.swapBnbNo,
                    iwTokenName: iwTokenName,
                    ircAccount: rowData.ircAccount,
                    ercTokenAmount: rowData.bnbTokenAmount
                }
                //iwbnb 수동 전송 기능
                let {data: result} = await AdminApi.issueIwIrcToUser(params);
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
        // let v_memo = null;
        // if(rowData.memo){
        //     v_memo = "("+rowData.memo+")";
        // }

        return(
            <div>
                {ircTokenPaidStat}
                {
                    !rowData.ircTokenPaid &&
                    <Span ml={10}>
                        <button onClick={onHandleClick}>수동전송</button>
                    </Span>
                }
                {/*{v_memo}*/}
            </div>
        )
    }

    function balanceCheckRenderer(props) {
        const rowData = props.data;
        const onHandleClick = async() => {
            let {data:bnbBalance} = await AdminApi.getBep20BNBBalance(rowData.swapAccount);
            alert(`${rowData.swapAccount} \nBNB잔고: ${bnbBalance}`);
        }

        return(
            <div>
                <Span ml={10}>
                    <button onClick={onHandleClick}>잔액조회</button>
                </Span>
            </div>
        )
    }


    async function managerBalance() {

        setBnbManagerLoading(true);

        // BNB ManagerAccount
        const {data:bnbManagerAccountData} = await AdminApi.getBnbManagerAccount(); //erc SwapManager
        setBnbManagerAccount(bnbManagerAccountData);

        // BNB SwapManager Balance
        // [0] manager 실 보유: (고객예치금 제외)
        // [1] manager 보유금: (고객예치금 포함)
        // [2] 고객예치금.
        // [3] 고객 총입금
        // [4] 고객 총출금
        const {data:bnbManagerBalanceData} = await AdminApi.getBnbManagerBalance();
        if(bnbManagerBalanceData) {
            setBnbManagerBalance({
                managerRealBalance:bnbManagerBalanceData[0],
                managerBalance:bnbManagerBalanceData[1],
                consumerBalance:bnbManagerBalanceData[2],
                consumerTotalDeposit:bnbManagerBalanceData[3],
                consumerTotalWithdraw:bnbManagerBalanceData[4]
            });
        }

        // donmanager igas
        const {data:managerIgas} = await AdminApi.getDonManagerIGas(); //iw토큰들은 donswap아닌 donmanager 이용.
        setManagerIGas(managerIgas);

        // donmanager iram
        const {data:managerIram} = await AdminApi.getDonManagerIRam(); //iw토큰들은 donswap아닌 donmanager 이용.
        setManagerIRam(managerIram);

        // BNB gas Price
        const {data:bnbGasPriceData} = await AdminApi.getBnbGasPrice();
        setBnbGasPrice(bnbGasPriceData);

        setBnbManagerLoading(false);
    }

    async function getContractID() {
        const {data} = await AdminApi.getIwTokenContractId(iwTokenName);
        const url = "https://www.iostabc.com/contract/" + data;
        setIostabcContractUrl(url);
    }

    async function search() {
        setLoading(true);
        const {data} = await AdminApi.bnbDepositSwap();

        data.map(item => {
            item.bnbTokenAmount = parseFloat(item.bnbTokenAmount)
        })

        if(data) {
            data.map(item => {
                item.manualSend = function () {
                    manualSendApprove(item);
                }
                item.transferOkClick = function () {
                    managerTransferOk(item);
                }
                item.checkTotalSwapAmount = function () {
                    checkTotalSwap("iwbnb", item);
                }
            })
        }

        setData(data);
        let totalDeposit = 0;
        if(data) {
            data.map(item => {
                totalDeposit = totalDeposit + parseFloat(item.bnbTokenAmount);
                // console.log(item);
            })
            totalDeposit = totalDeposit.toFixed(8);
        }
        setTotal(totalDeposit);
        setLoading(false);
    }

    // bnb토큰입금 수동전송
    async function manualSendApprove(item) {
        console.slog("수동 전송 approve 요청");
        if(window.confirm(item.ircAccount+'의 '+ item.bnbTokenAmount +'토큰을 bnbManager로 수동전송 하시겠습니까?')) {
            // 매니저  수동 전송
            const {data:approveResult} = await AdminApi.manualBnbDeposit(item.swapBnbNo);
            console.slog({approveResult});
            alert("Approve Result:"+approveResult);
        }
    }

    // bnb토큰입금 완료처리
    async function managerTransferOk(item) {
        if(window.confirm("상태값이 완료처리가 되어 배치처리가 됩니다!(수동전송이 아님! 주의! bnbscan에서 금액 확인후에 눌러주세요!)")) {
            const {data: result} = await AdminApi.updateBnbSwapDepositFinished(item.swapBnbNo);
            if (result === 200) {
                alert("변경이 완료되었습니다.");
                search();
            }
        }
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

    function copy ({value}) {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    return (
        <>
        <SearchBox>
            <Div>
                <Div>
                    <Div>
                        Manager 계좌 정보 <Button loading={bnbManagerLoading} onClick={managerBalance}>BNB Manager 검색</Button>
                    </Div>
                    <Div ml={10}>BnbManagerAccount : {bnbManagerAccount}</Div>
                    <Div ml={5}>
                        <Flex ml={10}>
                            <Div mr={10}>
                                BnbManager BNB : <Span fg="blue">{ComUtil.toCurrency(bnbManagerBalance.managerRealBalance)} </Span> <Span>({ComUtil.toCurrency(bnbManagerBalance.managerBalance)})</Span> <br/>
                            </Div>
                            <Div ml={20}>
                                고객예치금 : <Span fg="blue">{ComUtil.toCurrency(bnbManagerBalance.consumerBalance)}</Span> <br/>
                            </Div>
                            <Div ml={20}>
                                고객 총입금 : <Span fg="blue">{ComUtil.toCurrency(bnbManagerBalance.consumerTotalDeposit)}</Span> <br/>
                            </Div>
                            <Div ml={20}>
                                고객 총출금 : <Span fg="blue">{ComUtil.toCurrency(bnbManagerBalance.consumerTotalWithdraw)}</Span>
                            </Div>
                        </Flex>
                    </Div>
                    <Div ml={5}>
                        <Flex ml={10}>
                            <Div mr={10}>
                                DonManager IGas : <Span fg="blue">{ComUtil.toCurrency(managerIGas && managerIGas.toFixed(2))}</Span> <br/>
                            </Div>
                            <Div ml={10}>
                                DonManager IRam : <Span fg="blue">{ComUtil.toCurrency(managerIRam && managerIRam.toFixed(2))}</Span> <br/>
                            </Div>
                            <Div ml={20}>
                                BnbGasPrice : <Span fg="blue">{ComUtil.toCurrency(bnbGasPrice && bnbGasPrice.toFixed(2))}</Span>
                            </Div>
                        </Flex>
                    </Div>
                </Div>
                <Flex>
                    <Div my={10}>총 입금합계 : {ComUtil.toCurrency(total)} {bepTokenName}</Div>
                    <Div my={10} ml={20}><a href={`${iostabcContractUrl}`} target={'_blank'} fg={'primary'}>GO iostabc tokenContract</a></Div>
                </Flex>
                <Flex>
                    <Div mr={5}>
                        <Button loading={loading} onClick={search}>검색</Button>
                    </Div>
                    <Div>

                    </Div>
                </Flex>
                {/*<Flex>*/}
                {/*    <Div mr={5}>*/}
                {/*        <Button loading={loading} onClick={searchWithEth}>Eth 잔고출력</Button>*/}
                {/*    </Div>*/}
                {/*    <Div>*/}
                {/*        <Button loading={loading} onClick={searchWithErc}>Eth, {bepTokenName} 잔고출력</Button>*/}
                {/*    </Div>*/}
                {/*</Flex>*/}
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
export default BnbDepositSwap;