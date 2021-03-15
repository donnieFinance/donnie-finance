import React, { useState, useEffect } from 'react'
import {Div} from '~/styledComponents/shared'
import styled from 'styled-components'
import {color} from '~/styledComponents/Properties'
import {getValue} from "~/styledComponents/Util";
import {Button} from 'antd'

import ComUtil from '~/util/ComUtil'

import {useRecoilState} from "recoil";
import {adminState} from "~/hooks/atomState";

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

const ErcDonWithdrawSwap = (props) => {

    // 관리자 로그인 정보
    const [adminLoginInfo, ] = useRecoilState(adminState);

    //모달
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal();

    // 로딩 표시
    const [loading, setLoading] = useState(true);

    // ERC출금 리스트
    const [data, setData] = useState([]);

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
                headerName: "swapIrcToErcNo", field: "swapIrcToErcNo", width: 150
            },
            {
                headerName: "irc계정", field: "ircAccount", width: 120
            },
            {
                headerName: "swap 요청시간", field: "swapTimestamp",
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params){
                    const v_Date = params.data.swapTimestamp ? ComUtil.utcToString(params.data.swapTimestamp, 'YYYY.MM.DD HH:mm') : null;
                    return v_Date;
                }
            },
            {
                headerName: "swap 요청 토큰", field: "ircDonAmount", width: 150
            },
            {
                headerName: "ercDon 토큰양", field: "ercDonAmount", width: 150
            },
            {
                headerName: "Erc20 외부 송금 계좌", field: "ercExtAccount", width: 150
            },
            {
                headerName: "ercDon전송완료", field: "ercDonPaid", width: 150
            },
            {
                headerName: "ercDon 전송완료 시간", field: "ercDonPaidTime",
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                valueGetter: function(params){
                    const v_Date = params.data.ercDonPaidTime ? ComUtil.utcToString(params.data.ercDonPaidTime, 'YYYY.MM.DD HH:mm') : null;
                    return v_Date;
                }
            },
            {
                headerName: "memo", field: "memo", width: 150
            },
            {
                headerName: "txHash", field: "txHash", width: 150
            }
        ],
        frameworkComponents: {
            // statusButtonRenderer: statusButtonRenderer
        }
    }

    useEffect(() => {
        search()
    }, [])

    async function search() {
        setLoading(true);
        const {data} = await AdminApi.ercDonWidthdrawSwap();
        setData(data);
        setLoading(false);
    }

    return (
        <>
        <SearchBox>
            <Button loading={loading} onClick={search}>검색</Button>
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
                    rowData={data}>
                </AgGridReact>
            </Div>
        </Div>
        </>
    )
}
export default ErcDonWithdrawSwap;