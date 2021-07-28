import React, { useState, useEffect } from 'react'
import { Spin } from 'antd';
import {Div, FilterGroup, Flex, Hr, Right, Span} from '~/styledComponents/shared'
import styled from 'styled-components'
import {color} from '~/styledComponents/Properties'
import {getValue} from "~/styledComponents/Util";
import {Button, Modal} from 'antd'
import ComUtil from '~/util/ComUtil'
import {useRecoilState} from "recoil";
import {adminState} from "~/hooks/atomState";
import useModal from '~/hooks/useModal'
import {AgGridReact} from 'ag-grid-react';
import AdminApi from '~/lib/adminApi'
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import IdoWhiteListContent from "~/components/admin/ido/IdoWhiteListContent";
import IdoRegContent from "~/components/admin/ido/IdoRegContent";
import adminApi from "~/lib/adminApi";
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
const IdoList = (props) => {

    // 관리자 로그인 정보
    const [adminLoginInfo, ] = useRecoilState(adminState);

    //모달
    const [modalType, setModalType] = useState("");
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal();

    const [buyIdoContractId, setBuyIdoContractId] = useState("");
    // 로딩 표시
    const [loading, setLoading] = useState(true);

    // 리스트
    const [data, setData] = useState([]);

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
                headerName: "IdoID", field: "idoId", width: 100,
                cellRenderer: "idoIdRenderer"
            },
            {
                headerName: "IDO명", field: "idoName", width: 100
            },
            {
                headerName: "IDO토큰", field: "idoToken", width: 100
            },
            //2개 property로 옮기면서 미사용
            // {
            //     headerName: "참조정보URL", field: "url", width: 150
            // },
            // {
            //     headerName: "노출여부", field: "displayFlag", width: 100
            // },
            {
                headerName: "MaxWhiteListCount", field: "maxWhitelistCount", width: 300,
                cellRenderer: "whiteListCountRenderer"
            },
            {
                headerName: "WhiteListContractID", field: "whitelistContractId", width: 200
            },
            {
                headerName: "BuyIDOContractID", field: "buyIdoContractId", width: 200
            },
            {
                headerName: "추첨실행", field: "drawFlag", width: 200,
                cellRenderer:"drawRenderer"

            },
            {
                headerName: "남은 IDO토큰", field: "leftIdoToken", width: 120,
            },
            {
                headerName: "IDO Claim 여부 ", field: "claimIdoToken", width: 150, cellRenderer: "claimIdoRenderer"
            },
            {
                headerName: "Claim안한 Token", field: "idoTokenBalance", width: 150
            },

        ],
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        frameworkComponents: {
            idoIdRenderer: idoIdRenderer,
            drawRenderer:drawRenderer,
            whiteListCountRenderer:whiteListCountRenderer,
            claimIdoRenderer: claimIdoRenderer
        },
        onGridReady: onGridReady
    }

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    function onGridReady (params) {
        setGridApi(params.api);
    };

    function idoIdRenderer(props) {
        const rowData = props.data;
        const onHandleClick = async() => {
            if(window.confirm('IdoID:'+rowData.idoId+' \n해당 IDO 수정 하시겠습니까?\n(주의:운영중에는 수정안하는게 좋습니다!)')) {
                setModalType("IdoUpd")
                setSelected(rowData.idoId)
                onModalToggle();
            }
        }
        return(
            <div>
                {rowData.idoId}
                {
                    <Span ml={10}>
                        <Button type="primary" size="small" onClick={onHandleClick}>수정</Button>
                    </Span>
                }
            </div>
        )
    }

    function claimIdoRenderer(props) {
        const rowData = props.data;
        // console.log(rowData);
        const onHandleClick = async() => {
            if(window.confirm('IdoID:'+rowData.idoId+' \n해당 IDO token claim을 시작하시겠습니까? (중요:사전에 buyIdo에 토큰전송 필요)')) {
                // claim 시작 호출
                let {data: result} = await adminApi.setClaimTokenStatus(rowData.idoId);
                alert("claim 요청결과 : " + result);
                search();
            }
        }
        const claimIdoToken = rowData.claimIdoToken ? "가능" : "시작안함";
        return(
            <div>
                {claimIdoToken}
                {
                    (!rowData.claimIdoToken) && (
                        <Span ml={10}>
                            <Button type="primary" size="small" onClick={onHandleClick}>claim 시작</Button>
                        </Span>
                    )
                }
            </div>
        )
    }

    function whiteListCountRenderer(props) {
        const rowData = props.data;
        const onHandleClick = async() => {
            // if(window.confirm('IdoID:'+rowData.idoId+' \n해당 WhiteList 내역을 보시겠습니까?')) {
                setModalType("IdoWhiteList")
                setSelected(rowData.idoId)
                setBuyIdoContractId(rowData.buyIdoContractId);
                onModalToggle();
            // }
        }
        return(
            <div>
                {rowData.maxWhitelistCount}
                {
                    <Span ml={10}>
                        <Button type="primary" size="small" onClick={onHandleClick}>신청자조회,추첨내역보기,KYC인증</Button>
                    </Span>
                }
            </div>
        )
    }

    function drawRenderer(props) {
        const rowData = props.data;
        const onHandleClick = async() => {
            if(window.confirm('IdoID:'+rowData.idoId+' 추첨실행 하시겠습니까?\n(주의 WhitelistContractID 확인필요)')) {
                //추첨실행
                let {data: result} = await AdminApi.setIdoDrawWhitelistTask(rowData.idoId);
                if(result > 0){
                    if(result === 2) {
                        alert("추첨완료가 되었습니다!");
                    }
                    search();
                }
                if(result < 0){
                    if(result === -1) {
                        alert("추첨실행중 오류가 발생 되었습니다!");
                        search();
                    }
                    if(result === -9) {
                        alert("로그인 오류가 발생 되었습니다!");
                        search();
                    }
                }
            }
        }

        const onCompleteClick = async() => {
            if(window.confirm('IdoID:'+rowData.idoId+' 추첨완료처리 하시겠습니까? 시간이 오래 걸립니다.')) {
                //추첨완료처리
                let {data: result} = await AdminApi.finishDrawWhitelist(rowData.idoId);
                console.log(result);
                if(result) {
                    alert("처리완료 되었습니다");
                    search();
                } else {
                    alert("오류가 발생하였습니다");
                }
            }
        }

        const drawFlagStatus = rowData.drawFlag;
        let status = '미추첨(0)';
        if(drawFlagStatus === -1) status = '추첨오류(-1)'
        if(drawFlagStatus === 1) status = '추첨중(1)'
        if(drawFlagStatus > 1) status = '추첨완료(' + drawFlagStatus + ')'

        return(
            <div>
                {status}
                {
                    drawFlagStatus === 0 &&
                    <Span ml={10}>
                        <Button type="primary" size="small" onClick={onHandleClick}>추첨실행</Button>
                    </Span>
                }
                {
                    drawFlagStatus === 2 &&
                    <Span ml={10}>
                        <Button type="primary" size="small" onClick={onCompleteClick}>추첨완료처리</Button>
                    </Span>
                }
            </div>
        )
    }

    useEffect(() => {
        search()
    }, [])

    const search = async() => {
        setLoading(true);
        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }
        const {data} = await AdminApi.getIdoList();
        //console.log(data);
        setData(data);
        setLoading(false);
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()
        }
    }

    const onModalToggle = () => {
        setModalOpen(!modalOpen)
    }

    const onClose = (isSearch) => {
        setModalOpen(false)
        if(isSearch){
            search();
        }
    }

    // IDO 등록
    const onIdoReg = () => {
        setModalType("IdoReg")
        setSelected(0)
        onModalToggle();
    }

    function copy ({value}) {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    return (
        <div>
            <SearchBox>
                <Div>
                    <Flex>
                        <Div mr={5}>
                            <Button loading={loading} onClick={search}>검색</Button>
                        </Div>
                        <Right>
                            <Button loading={loading} onClick={onIdoReg}>IDO등록</Button>
                        </Right>
                    </Flex>
                </Div>


            </SearchBox>

            <FilterContainer gridApi={gridApi}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'idoId', name: 'IdoID'},
                            {field: 'idoName', name: 'IDO명'},
                            {field: 'idoToken', name: 'IDO토큰'},
                            {field: 'whitelistContractId', name: 'WhiteListContractID'},
                            {field: 'buyIdoContractId', name: 'BuyIDOContractID'}
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
                <Hr/>
                <FilterGroup>
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'displayFlag'}
                        name={'노출여부'}
                        data={[
                            {value: false, name: 'false'},
                            {value: true, name: 'true'}
                        ]}
                    />
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'drawFlag'}
                        name={'추첨실행'}
                        data={[
                            {value: -1, name: '추첨오류(-1)'},
                            {value: 0, name: '미추첨(0)'},
                            {value: 1, name: '추첨중(1)'},
                            {value: 2, name: '추첨완료(2)'},
                            {value: 3, name: '추첨완료(3)'}
                        ]}
                    />
                </FilterGroup>
            </FilterContainer>

            <Div my={10}>
                <Spin spinning={loading}>
                    <Div className="ag-theme-balham" height={600}>
                        <AgGridReact
                            gridOptions={gridOptions}
                            rowData={data}
                            onCellDoubleClicked={copy}
                        >
                        </AgGridReact>
                    </Div>
                </Spin>
            </Div>
            <Modal
                title={"IDO "+ (selected?'수정':'등록')}
                visible={(modalType==='IdoReg'||modalType==='IdoUpd') && modalOpen}
                footer={null}
                centered={true}
                getContainer={false}
                maskClosable={false}
                destroyOnClose={true}
                bodyStyle={{padding:0}}
                onCancel={()=> {
                    setModalOpen(false)
                }}
            >
                <IdoRegContent idoId={selected} onClose={onClose} />
            </Modal>
            <Modal
                title={"추첨내역"+(selected?'[IDO ID:'+selected+']':'')}
                visible={(modalType==='IdoWhiteList') && modalOpen}
                footer={null}
                centered={true}
                getContainer={false}
                maskClosable={false}
                destroyOnClose={true}
                bodyStyle={{padding:0, height:900}}
                width={1500}
                onCancel={()=> {
                    setModalOpen(false)
                }}
            >
                <IdoWhiteListContent idoId={selected} buyIdoContractId={buyIdoContractId} onClose={onClose}/>
            </Modal>
        </div>
    )
}
export default IdoList;