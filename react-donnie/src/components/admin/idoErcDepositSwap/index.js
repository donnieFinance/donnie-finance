import React, { useState, useEffect } from 'react'
import {Div, FilterGroup, Flex, Hr, Span} from '~/styledComponents/shared'
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
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";

const SearchBox = styled.div`
    background-color: ${color.white};
    padding: ${getValue(10)};    
    
    & > * {
        margin-right: ${getValue(10)};
    }
    
    & button {
        padding: ${getValue(5)} ${getValue(10)};
    }
`;

const IdoErcDepositSwap = ({iwTokenName, ercTokenName}) => {

    // const iwTokenName = 'iwwitch'; //중요: 통신용 //TODO 이변수 사용해서 전면 수정
    // const ercTokenName = 'WITCH';  //display용 - 안중요.

    // 관리자 로그인 정보
    const [adminLoginInfo, ] = useRecoilState(adminState);

    //모달
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal();

    // 로딩 표시
    const [loading, setLoading] = useState(true);
    const [ethLoading, setEthLoading] = useState(false);

    // ERC입금 리스트
    const [data, setData] = useState([]);

    // 총 입금합계
    const [total, setTotal] = useState(0);

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

    const [gridApi, setGridApi] = useState()

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
                headerName: "No", field: "swapErcToIrcNo", width: 80
            },
            {
                headerName: "irc계정", field: "ircAccount", width: 120
            },
            {
                headerName: "swap계정", field: "swapAccount", width: 300, cellRenderer: 'ethAccountRenderer'
            },
            {
                headerName: "입금erc " + ercTokenName, field: "ercTokenAmount", width: 140
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
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                //cellRenderer: "managerTransferRenderer"
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
                headerName: iwTokenName +" (irc전송)", field: "ircTokenPaid",  //width: 110, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                cellRenderer: 'sudongSendRenderer'
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
                headerName: ercTokenName +" 잔고", field: "ercTokenBalance",
                cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                width: 120, cellRenderer: 'balanceCheckRenderer'
            }
        ],
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        frameworkComponents: {
            ethAccountRenderer: ethAccountRenderer,
            managerTransferRenderer: managerTransferRenderer,
            balanceCheckRenderer: balanceCheckRenderer,
            ethBalanceRenderer: ethBalanceRenderer,
            sudongSendRenderer: sudongSendRenderer
        },
        onGridReady: onGridReady
    }

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    function onGridReady (params) {
        setGridApi(params.api);
    };


    function ethAccountRenderer ({value}) {
        let ethScanUrl = 'https://etherscan.io/address/';
        if(properties.isTestMode){
            ethScanUrl = 'https://ropsten.etherscan.io/address/';
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

    function sudongSendRenderer(props) {
        const rowData = props.data;
        const onHandleClick = async() => {
            if(window.confirm(rowData.ircAccount+'의 '+ rowData.ercTokenAmount +'토큰을 수동전송 하시겠습니까?(전송+DB update)')) {
                const params = {
                    swapErcToIrcNo: rowData.swapErcToIrcNo,
                    iwTokenName: iwTokenName,
                    ircAccount: rowData.ircAccount,
                    ercTokenAmount: rowData.ercTokenAmount
                }
                //approve된 Iw ERC토큰 수동 전송 기능
                let {data: result} = await AdminApi.issueIdoIrcToUser(params);
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
                {v_memo}
            </div>
        )
    }

    function ethBalanceRenderer(props) {
        const rowData = props.data;
        const onHandleClick = async() => {
            console.slog("가스 수동전송");
            let {data:result} = await AdminApi.sendWeiWithGasPrice(rowData.swapAccount);
            alert(result);
        }
        const onRetrivalClick = async() => {
            console.slog("eth don 회수");
            let {data:result} = await AdminApi.iwErcAccountWeiRetrieval(iwTokenName, rowData.swapAccount);
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
            let {data:result} = await AdminApi.getIwEthErcBalance(iwTokenName, rowData.swapAccount);
            alert(rowData.swapAccount + "\nEth: " + result[0] + "\n" +ercTokenName + ": " + result[1]);
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
        getManagerBalance()
    }, [])

    const getManagerBalance = async () => {

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

    }

    const search = async () => {
        setLoading(true);
        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }
        const {data} = await AdminApi.idoErcDepositSwap(iwTokenName, false, false);

        data && data.map(item => item.transferOkClick = function() {
            managerTransferOk(item);
        })

        setData(data);
        let totalDeposit = 0;
        data && data.map(item => {
            totalDeposit = totalDeposit + parseFloat(item.ercTokenAmount);
            // console.log(item);
        })
        setTotal(totalDeposit);
        setLoading(false);
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()
        }
    }

    async function managerTransferOk(item) {
        const {data:result} = await AdminApi.updateIdoErcSwapFinished(iwTokenName, item.swapErcToIrcNo);
        if(result === 200) {
            alert("변경이 완료되었습니다.");
            search();
        }
    }

    async function searchWithEth() {
        setEthLoading(true);
        const {data} = await AdminApi.idoErcDepositSwap(iwTokenName, true, false);
        setData(data);
        setEthLoading(false);
    }

    async function searchWithIdoErc() {
        setEthLoading(true);
        const {data} = await AdminApi.idoErcDepositSwap(iwTokenName, true,true);
        setData(data);
        setEthLoading(false);
    }

    function copy ({value}) {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    return (
        <div>
            <SearchBox>
                <Div>
                    <Div>
                        <Div>Manager 계좌 정보</Div>
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
                    <Div my={10}>총 입금합계 : {total} {ercTokenName}</Div>
                    <Flex>
                        <Div mr={5}>
                            <Button loading={loading} onClick={search}>검색</Button>
                        </Div>
                        <Div mr={5}>
                            <Button loading={ethLoading} onClick={searchWithEth}>Eth 잔고출력</Button>
                        </Div>
                        <Div>
                            <Button loading={ethLoading} onClick={searchWithIdoErc}>Eth, {ercTokenName} 잔고출력</Button>
                        </Div>
                    </Flex>
                </Div>


            </SearchBox>
            {/* filter START */}
            <FilterContainer gridApi={gridApi} excelFileName={'쿠폰마스터 목록'}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'ircAccount', name: 'irc계정'},
                            {field: 'swapAccount', name: 'swap계정'},
                            {field: 'ercTokenAmount', name: '입금erc '+ercTokenName},
                            {field: 'recordCreateTime', name: 'swap 시작시간'},
                            {field: 'managerTransferedTime', name: 'manager 전송시간'},
                            {field: 'ircTokenPaidTime', name: 'swap 완료시간'},
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
                <Hr/>
                <FilterGroup>
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'managerTransfered'}
                        name={'manager전송'}
                        data={[
                            {value: 0, name: '0. 전송중'},
                            {value: 1, name: '1. 전송중'},
                            {value: 2, name: '2. 전송성공'},
                        ]}
                    />
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'ircTokenPaid'}
                        name={iwTokenName + ' irc전송'}
                        data={[
                            {value: true, name: '전송완료'},
                            {value: false, name: '미완료'},
                        ]}
                    />
                </FilterGroup>
            </FilterContainer>
            {/* filter END */}
            <Div my={10}>
                {/*<Flex bg={'white'} my={10} p={10}>*/}
                {/*<Div>test</Div>*/}
                {/*<Div>test</Div>*/}
                {/*<Div>test</Div>*/}
                {/*</Flex>*/}
                <Div className="ag-theme-balham" height={600}>
                    <AgGridReact
                        gridOptions={gridOptions}
                        rowData={data}
                        onCellDoubleClicked={copy}
                    >
                    </AgGridReact>
                </Div>
            </Div>
        </div>
    )
}
export default IdoErcDepositSwap;