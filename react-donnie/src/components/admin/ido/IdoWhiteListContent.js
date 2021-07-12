import React, { useState, useEffect } from 'react'
import {Button as StyledButton, Div, FilterGroup, Flex, Hr, Right, Span} from '~/styledComponents/shared'
import ComUtil from '~/util/ComUtil'
import properties from "~/properties";
import {AgGridReact} from 'ag-grid-react';
import AdminApi from '~/lib/adminApi'
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import {Button, Select, Radio} from "antd";
import styled from "styled-components";
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
import CodeUtil from '~/util/CodeUtil'
import idoApi from "~/lib/idoApi";
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
// IDO 추첨내역보기 컨텐트
const IdoWhiteListContent = (props) => {
    const [gridApi, setGridApi] = useState()
    const [idoId,setIdoId] = useState(props.idoId||0)
    const [loading, setLoading] = useState(false)
    const [dataList,setDataList] = useState([])
    const [selectedRows, setSelectedRows] = useState([]);
    const [countryList,] = CodeUtil.ConuntryList();
    const [kycNot,setKycNot] = useState("");

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
        rowSelection:'multiple',
        rowHeight:70,
        columnDefs: [
            {
                headerName: "Account", field: "account", width: 140,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,  //전체 체크시 필터된 것만 체크
                checkboxSelection: true,
                pinned: 'left'
            },
            {
                headerName: "당첨", field: "winFlag", width: 70,
                cellStyle:getCellStyle({cellAlign: 'center'}),
                pinned: 'left'
            },
            {
                headerName: "컨트랙트기록", field: "contractSuccess", width: 120,
                cellStyle:getCellStyle({cellAlign: 'center'}),
                pinned: 'left'
            },
            {
                headerName: "KYC인증(front)", field: "kycLevel", width: 140,
                cellStyle:getCellStyle({cellAlign: 'center'}),
                cellRenderer: "kYCLevelRenderer",
                pinned: 'left'
            },
            {
                headerName: "origin", field: "originTicket", width: 100,
                cellStyle:getCellStyle({cellAlign: 'center'})
            },
            // {
            //     headerName: "weighted", field: "weightedTicket", width: 110,
            //     cellStyle:getCellStyle({cellAlign: 'center'})
            // },
            {
                headerName: "WeightInt", field: "intWeight", width: 110,
                cellStyle:getCellStyle({cellAlign: 'center'})
            },
            {
                headerName: "국가", field: "countryCode", width: 80,
                cellStyle:getCellStyle({cellAlign: 'center'}),
                cellRenderer: "kYCNotCountryRenderer"
            },
            {
                headerName: "여권", field: "passportImage", width: 100,
                cellStyle:getCellStyle({cellAlign: 'center'}),
                cellRenderer:"passportImageRenderer"
            },
            {
                headerName: "셀피", field: "selfiImage", width: 100,
                cellStyle:getCellStyle({cellAlign: 'center'}),
                cellRenderer:"selfiImageRenderer"
            },
            {
                headerName: "KYC승인(admin)", field: "kycAuth", width: 150,
                cellStyle:getCellStyle({cellAlign: 'center'}),
                cellRenderer: "kYCAuthRenderer"
            },
            {
                headerName: "거절사유", field: "kycReason", width: 250,
                cellStyle:getCellStyle({cellAlign: 'left'})
            },
            {
                headerName: "신청토큰 수", field: "idoTokenAmount", width: 190,
                cellStyle:getCellStyle({cellAlign: 'left'}),
                cellRenderer: "claimRenderer"
            },
        ],
        frameworkComponents: {
            kYCLevelRenderer:kYCLevelRenderer,
            kYCNotCountryRenderer:kYCNotCountryRenderer,
            kYCAuthRenderer:kYCAuthRenderer,
            passportImageRenderer:passportImageRenderer,
            selfiImageRenderer:selfiImageRenderer,
            claimRenderer:claimRenderer
        },
        onGridReady: onGridReady
    }

    // Ag-Grid Cell 스타일 기본 적용 함수
    function getCellStyle ({cellAlign,color,textDecoration,whiteSpace}) {
        if(cellAlign === 'left') cellAlign='flex-start';
        else if(cellAlign === 'center') cellAlign='center';
        else if(cellAlign === 'right') cellAlign='flex-end';
        else cellAlign='flex-start';
        return {
            display: "flex",
            alignItems: "center",
            justifyContent: cellAlign,
            color: color,
            textDecoration: textDecoration,
            whiteSpace: whiteSpace
        }
    }

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    function onGridReady (params) {
        setGridApi(params.api);
    };

    function kYCNotCountryRenderer ({value, data:rowData}) {
        let kycCountryCode = value;
        if(ComUtil.isKycNotCountryChk(kycCountryCode)){
         return <Span fg={'red'}>{kycCountryCode}</Span>
        }
        return kycCountryCode;
    }

    function kYCLevelRenderer ({value, data:rowData}) {
        let kycLevelStatus = '미인증(0)';
        if(value === 1) {
            kycLevelStatus = '인증(1)'
        }
        return kycLevelStatus;
    }

    function kYCAuthRenderer ({value, data:rowData}) {
        let kycAuthStatus = '';
        if(value === -1) {
            kycAuthStatus = '거절(-1)'
        } else if(value === 0) {
            kycAuthStatus = '미승인(0)'
        } else if(value === 1) {
            kycAuthStatus = '신청(1)'
        } else if(value === 2){
            kycAuthStatus = '승인(2)'
        } else if(value === 99){
            kycAuthStatus = <><Span>컨트랙트실패(99)</Span><StyledButton bg={'info'} fg={'white'} onClick={onContractReSend.bind(this,rowData)}>재요청</StyledButton></>
        } else {
            kycAuthStatus = ''
        }
        return kycAuthStatus;
    }

    //여권사진 렌더러
    function passportImageRenderer ({value: image, data:rowData}) {
        if(!rowData.hasPassportImage) {return "";}
        const Style = {
            width: 75, height: 75, paddingRight: '1px'
        };
        if(!image){return "";}
        const src = properties.DOMAIN + image.imageUrlPath + image.imageUrl;
        return <Div onClick={onPhotoWinPop.bind(this,src)}><img src={src} style={Style} alt={'여권'}/></Div>
    };

    //셀피사진 렌더러
    function selfiImageRenderer ({value: image, data:rowData}) {
        if(!rowData.hasSelfiImage) {return "";}
        const Style = {
            width: 75, height: 75, paddingRight: '1px'
        };
        if(!image){return "";}
        const src = properties.DOMAIN + image.imageUrlPath + image.imageUrl;
        return <Div onClick={onPhotoWinPop.bind(this,src)}><img src={src} style={Style} alt={'셀피'}/></Div>
    };

    function claimRenderer(data) {
        const rowData = data.data;
        const onHandleClick = async() => {
            const claimResult = await idoApi.alreadyClaim(props.buyIdoContractId, rowData.account);
            const text = claimResult ? "완료" : "Not Yet";
            alert("claim 여부 : " + text);
        }
        return(
            <div>
                {rowData.idoTokenAmount}
                {
                    (rowData.idoTokenAmount) && (
                        <Span ml={10}>
                            <Button type="primary" size="small" onClick={onHandleClick}>claim 여부</Button>
                        </Span>
                    )
                }
            </div>
        )
    }

    useEffect(() => {
        search()
    }, [])

    const search = async () => {
        if(idoId > 0) {
            setLoading(true)
            if(gridApi) {
                //ag-grid 레이지로딩중 보이기
                gridApi.showLoadingOverlay();
            }
            const {data:dataInfo} = await AdminApi.getIdoWhiteList(idoId);
            if (dataInfo) {
                setDataList(dataInfo);
            }
            setLoading(false)
            if(gridApi) {
                //ag-grid 레이지로딩중 감추기
                gridApi.hideOverlay()
            }
        }
    }

    const onSelectionChanged = (event) => {
        updateSelectedRows();
    }
    const updateSelectedRows = () => {
        const itemList = gridApi.getSelectedRows();
        const applyList = []
        itemList.map((item) => {
            // 당첨, 컨트랙트기록, KYC신청이 된 경우만 KYC승인처리
            if(
                item.winFlag && item.contractSuccess
                //&& item.kycAuth === 1
            ){
                applyList.push(item);
            }
        })
        setSelectedRows(applyList)
    }

    function copy ({value}) {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    const onPhotoWinPop = async (imgUrlSrc) => {
        window.open(imgUrlSrc,'_blank');
    }

    const onContractReSend = async (item) =>{
        const account = item.account;
        if (window.confirm(`${account}을 컨트랙트 실패를 재전송 처리를 하시겠습니까?`)) {
            try{
                const {data:res} = await AdminApi.retryContractKycAuth(idoId,item.account);
                if(res == 99){
                    alert('99 컨트랙트 실패! 다시 시도하세요.')
                }
                if(res == 2){
                    alert(`${account}이 컨트랙트 재전송 처리가 되었습니다.`)
                    await search();
                }

            }catch (err){
                alert('에러가 발생하였습니다. 다시 시도해 주세요.')
            }
        }
    }

    const onKYCClick = async () => {
        const resList = selectedRows;
        if (window.confirm(`${resList.length}건을 KYC승인처리를 하시겠습니까? (1건당 1분가량 소요-완료팝업 대기필요)`)) {
            try{
                const resultList = await Promise.all(
                    resList.map(async (item) => {
                        const {data} = await AdminApi.setIdoWhitelistKYCApply(idoId,item.account);
                        if(data > 0){
                            return item;
                        }
                    })
                )
                alert(`${resultList.length}건이 KYC승인처리 되었습니다.`)
                setSelectedRows([]);
                await search();
            }catch (err){
                alert('에러가 발생하였습니다. 다시 시도해 주세요.')
            }
        }
    }

    const onKYCNotClick = async (e) => {
        const kycNotCode= e.target.value;
        const resList = selectedRows;
        setKycNot(e.target.value)
        let kycReason = "";
        if(kycNotCode == 1) kycReason="passport photo wrong";
        if(kycNotCode == 2) kycReason="passport selfi photo wrong";
        if(kycNotCode == 3) kycReason="passport is not country kyc";
        if(kycNotCode == 4) kycReason="passport wrong";
        if(kycNotCode){
            const vNonce = window.prompt("거절사유를 영어(Eng)로 입력해주세요! (확인시 확인창이 한번 더 뜹니다)",kycReason)
            if (!vNonce) {
                return
            }
            kycReason = vNonce;
        }
        if (window.confirm(`${resList.length}건을 KYC승인거절처리를 하시겠습니까?`)) {
            try{
                const resultList = await Promise.all(
                    resList.map(async (item) => {
                        const {data} = await AdminApi.setIdoWhitelistKYCApplyNot(idoId,item.account,kycReason);
                        if(data > 0){
                            return item;
                        }
                    })
                )
                alert(`${resultList.length}건이 KYC승인거절처리 되었습니다.`)
                setSelectedRows([]);
                await search();
            }catch (err){
                alert('에러가 발생하였습니다. 다시 시도해 주세요.')
            }
        }
    }

    return(
        <div>
            <FilterContainer gridApi={gridApi}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'account', name: 'Account'},
                            {field: 'weightedTicket', name: 'Ticket'},
                            {field: 'intWeight', name: 'Weight'},
                            {field: 'countryCode', name:'국가'}
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
                <Hr/>
                <FilterGroup>
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'winFlag'}
                        name={'당첨'}
                        data={[
                            {value: false, name: 'false'},
                            {value: true, name: 'true'}
                        ]}
                    />
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'contractSuccess'}
                        name={'컨트랙트기록'}
                        data={[
                            {value: false, name: 'false'},
                            {value: true, name: 'true'}
                        ]}
                    />
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'kycLevel'}
                        name={'KYC인증'}
                        data={[
                            {value: 0, name: '미인증(0)'},
                            {value: 1, name: '인증(1)'}
                        ]}
                    />
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'kycAuth'}
                        name={'KYC승인'}
                        data={[
                            {value: -1, name: '거절(-1)'},
                            {value: 0, name: '미승인(0)'},
                            {value: 1, name: '신청(1)'},
                            {value: 2, name: '승인(2)'},
                            {value: 99, name: '컨트랙트실패(99)'}
                        ]}
                    />
                </FilterGroup>
            </FilterContainer>
            <SearchBox>
                <Div>
                    <span>
                        KYC 금지국가 : <br/>
                        Afghanistan(AFG), Albania(ALB), Belarus(BLR), Bosnia and Herzegovina(BIH),
                        Burundi(BDI), Burma(MMR), Canada(CAN), China(CHN),
                        Korea (Democratic People’s Republic of) (PRK),
                        Democratic Republic of Congo(COG,COD), Cuba(CUB), Ethiopia(ETH),
                        Guinea-Bissau(GNB), Guinea(GNQ,GIN,GNB,PNG), Iran(IRN), Iraq(IRQ), Japan(JPN), Liberia(LBR),
                        Lebanon(LBN), Libya(LBY), Macedonia(MKD), Malaysia(MYS),
                        New Zealand(NZL), Serbia(SRB), Sri Lanka(LKA), Sudan(SDN), Somalia(SOM), Syria(SYR),
                        Thailand(THA), Trinidad and Tobago(TTO), Tunisia(TUN), Uganda(UGA), Ukraine(UKR),
                        United States of America(USA), Venezuela(VEN), Yemen(YEM), Zimbabwe(ZWE).
                    </span>
                </Div>
            </SearchBox>
            <SearchBox>
                <Div>
                    <Flex>
                        <Div mr={5}>
                            <Button loading={loading} onClick={search}>검색</Button>
                            {
                                (selectedRows.length > 0) &&
                                <>
                                    <StyledButton ml={10} bg={'info'} fg={'white'} onClick={onKYCClick}>{selectedRows.length}건 KYC승인처리 [당첨(Y),컨트랙트기록(Y),KYC신청(1)]</StyledButton>
                                     (KYC거절
                                    <Radio.Group value={kycNot} onChange={onKYCNotClick}>
                                        <Radio.Button style={{color: "red" }} value="1">여권사진 잘못됨</Radio.Button>
                                        <Radio.Button style={{color: "red" }} value="2">여권셀피사진 잘못됨</Radio.Button>
                                        <Radio.Button style={{color: "red" }} value="3">여권KYC안되는국가</Radio.Button>
                                        <Radio.Button style={{color: "red" }} value="4">기타사유거절</Radio.Button>
                                    </Radio.Group>)
                                </>
                            }
                        </Div>
                        <Right>

                        </Right>
                    </Flex>
                </Div>
            </SearchBox>
            <Div my={10} pb={10} pl={10} pr={10}>
                <Div className="ag-theme-balham" height={600}>
                    <AgGridReact
                        gridOptions={gridOptions}
                        rowData={dataList}
                        onCellDoubleClicked={copy}
                        onSelectionChanged={onSelectionChanged}
                    >
                    </AgGridReact>
                </Div>
            </Div>
        </div>
    )
}
export default IdoWhiteListContent;