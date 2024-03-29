import React, { useState, useEffect } from 'react'
import {Div, Flex, Span, Right} from '~/styledComponents/shared'
import styled from 'styled-components'
import {color} from '~/styledComponents/Properties'
import {getValue} from "~/styledComponents/Util";
import {Button, Input} from 'antd'
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

const AvaxWithdrawSwap = () => {

    const iwTokenName = "iwavax";
    const bepTokenName = "AVAX";

    const [gridApi, setGridApi] = useState(null);

    // 로딩 표시
    const [managerLoading, setManagerLoading] = useState(true);
    const [loading, setLoading] = useState(true);


    const [managerAccount, setManagerAccount] = useState("");
    /*
    // [0] manager 실 보유: (고객예치금 제외)
    // [1] manager 보유금: (고객예치금 포함)
    // [2] 고객예치금.
    // [3] 고객 총입금
    // [4] 고객 총출금
    */
    const [managerBalance, setManagerBalance] = useState({
        managerRealBalance:0,
        managerBalance:0,
        consumerBalance:0,
        consumerTotalDeposit:0,
        consumerTotalWithdraw:0
    });
    const [gasPrice, setGasPrice] = useState(0);

    // 출금 리스트
    const [data, setData] = useState([]);

    // 스왑매니저 정보, Eth 및 Gas 정보
    const [swapManagerAccount, setSwapManagerAccount] = useState("");
    const [swapManagerEth, setSwapManagerEth] = useState(0);
    const [managerIGas, setManagerIGas] = useState(0);
    const [managerIRam,setManagerIRam] = useState(0);
    const [ethGasGwei, setEthGasGwei] = useState(0);

    // 총 출금합계
    const [total, setTotal] = useState(0);
    const [withdrawSequence, setWithdrawSequence] = useState(0);

    // 수동 erc 출금
    const [manualWithdrawSeq, setWithdrawSeq] = useState(0);

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
                headerName: "IRC계정", field: "ircAccount", width: 200, cellRenderer: 'ircAccountRenderer'
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
                headerName: "IRC 출금요청토큰", field: "amount", width: 150
            },
            {
                headerName: "ERC출금(-fee)", field: "ercWithdrawAmount", width: 150
            },
            {
                headerName: "AVAX계정", field: "ercAccount", width: 150, cellRenderer: 'bepAccountRenderer'
            },
            {
                headerName: "IRC Status", field: "status", width: 120, cellRenderer: 'ircStatusRenderer'
            },
            {
                headerName: "AVAX 전송시간", field: "ercRequestTime",
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
                headerName: "ERC txHash", field: "ercTxHash", width: 200
            },
            {
                headerName: "ERC Status", field: "ercStatus", width: 200,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                cellRenderer: 'sudongSendRenderer'
            }
        ],
        frameworkComponents: {
            ircAccountRenderer: ircAccountRenderer,
            bepAccountRenderer: bepAccountRenderer,
            ircStatusRenderer: ircStatusRenderer,
            sudongSendRenderer:sudongSendRenderer
        }
    }

    useEffect(() => {
        search();
        getManagerBalance();
        if(gridApi) {
            gridApi.setColumnDefs([]);
            gridApi.setColumnDefs(gridOptions.columnDefs);
        }
    }, [iwTokenName])


    function bepAccountRenderer ({value}) {
        let bscScanUrl = 'https://snowtrace.io/address/';
        if(properties.isTestMode){
            bscScanUrl = 'https://testnet.snowtrace.io/address/';
        }
        return value && <><a href={`${bscScanUrl}${value}`} target={'_blank'} fg={'primary'} ml={10} ><u>AvaxScan</u></a> <span>{value}</span></>
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

    function sudongSendRenderer(props) {
        const rowData = props.data;
        const onHandleClick = async() => {
            if(window.confirm('AVAX토큰을 수동전송 하시겠습니까?(실패가 확실할때만 해야합니다)')) {
                const params = {
                    withdrawSeq: rowData.withdrawSeq,
                    receiverAddr: rowData.ercAccount,
                    tokenAmount: rowData.amount
                }
                //approve된 Iw ERC토큰 수동 전송 기능
                let {data: result} = await AdminApi.sendUserAvaxToExtAccount(params);
                alert(result);
                if (window.confirm('다시 재 검색하시겠습니까?')) {
                    search();
                }
            }
        }
        let status = '요청';
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
                        <button onClick={onHandleClick}>수동전송(위험)</button>
                    </Span>
                }
            </div>
        )
    }

    async function getManagerBalance() {

        setManagerLoading(true);

        // AVAX ManagerAccount
        const {data:managerAccountData} = await AdminApi.getAvaxManagerAccount(); //erc SwapManager
        setManagerAccount(managerAccountData);

        // AVAX SwapManager Balance
        // [0] manager 실 보유: (고객예치금 제외)
        // [1] manager 보유금: (고객예치금 포함)
        // [2] 고객예치금.
        // [3] 고객 총입금
        // [4] 고객 총출금
        const {data:managerBalanceData} = await AdminApi.getAvaxManagerBalance();
        if(managerBalanceData) {
            setManagerBalance({
                managerRealBalance:managerBalanceData[0],
                managerBalance:managerBalanceData[1],
                consumerBalance:managerBalanceData[2],
                consumerTotalDeposit:managerBalanceData[3],
                consumerTotalWithdraw:managerBalanceData[4]
            });
        }

        // donmanager igas
        const {data:managerIgas} = await AdminApi.getDonManagerIGas(); //iw토큰들은 donswap아닌 donmanager 이용.
        setManagerIGas(managerIgas);

        // donmanager iram
        const {data:managerIram} = await AdminApi.getDonManagerIRam(); //iw토큰들은 donswap아닌 donmanager 이용.
        setManagerIRam(managerIram);

        // Avax gas Price
        const {data:gasPriceData} = await AdminApi.getAvaxGasPrice();
        setGasPrice(gasPriceData);

        setManagerLoading(false);
    }


    async function search() {
        setLoading(true);
        const {data:sequence} = await AdminApi.getIwMaxWithdrawSequence(iwTokenName)
        setWithdrawSequence(sequence);


        const {data} = await AdminApi.iwIrcWithdrawSwap(iwTokenName);
        if(data) {
            data.map(item => {
                item.withdrawSeq = parseFloat(item.withdrawSeq)
                item.amount = parseFloat(item.amount)
                item.checkTotalSwapAmount = function () {
                    checkTotalSwap(iwTokenName, item);
                }
            });

            // data.map(item => item.approveAllowanceClick = function () {
            //     userApproveAmt(iwTokenName, item);
            // })
        }
        setData(data);

        let totalWithdraw = 0;
        if(data) {
            data.map(item => {
                totalWithdraw = totalWithdraw + parseFloat(item.amount);
                // console.log(item);
            })
            totalWithdraw = totalWithdraw.toFixed(8);
        }
        setTotal(totalWithdraw);
        setLoading(false);
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

    function copy ({value}) {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    const onChangeWithdrawSeq = ({target}) => {
        const {name, value} = target
        setWithdrawSeq(value);
    }

    async function onWithdrawManual() {
        const {data:resultStr} = await AdminApi.sendUserIwErcToExtAccountManual(manualWithdrawSeq, iwTokenName);
        alert(resultStr);
    }

    return (
        <>
            <SearchBox>
                <Div>
                    <Div>
                        <Div>
                            Manager 계좌 정보 <Button loading={managerLoading} onClick={getManagerBalance}>AVAX Manager 검색</Button>
                        </Div>
                        <Div ml={5}>AvaxManagerAccount : {managerAccount}</Div>
                        <Div ml={5}>
                            <Flex ml={10}>
                                <Div mr={10}>
                                    AvaxManager AVAX : <Span fg="blue">{ComUtil.toCurrency(managerBalance.managerRealBalance)} </Span> <Span>({ComUtil.toCurrency(managerBalance.managerBalance)})</Span> <br/>
                                </Div>
                                <Div ml={20}>
                                    고객예치금 : <Span fg="blue">{ComUtil.toCurrency(managerBalance.consumerBalance)}</Span> <br/>
                                </Div>
                                <Div ml={20}>
                                    고객 총입금 : <Span fg="blue">{ComUtil.toCurrency(managerBalance.consumerTotalDeposit)}</Span> <br/>
                                </Div>
                                <Div ml={20}>
                                    고객 총출금 : <Span fg="blue">{ComUtil.toCurrency(managerBalance.consumerTotalWithdraw)}</Span>
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
                                    AvaxGasPrice : <Span fg="blue">{ComUtil.toCurrency(gasPrice && gasPrice.toFixed(2))}</Span>
                                </Div>
                            </Flex>
                        </Div>
                    </Div>
                    <Div my={10}>총 출금합계 : {ComUtil.toCurrency(total)} {bepTokenName}</Div>
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
                        onCellDoubleClicked={copy}
                    >
                    </AgGridReact>
                </Div>
            </Div>
        </>
    )
}

export default AvaxWithdrawSwap;