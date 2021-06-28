import React, {useEffect, useState} from 'react';
import {Div, Flex, Button, GridColumns} from "~/styledComponents/shared";
import {useRecoilState} from "recoil";
import {allFilterClearState} from "~/hooks/atomState";
import useInterval from "~/hooks/useInterval";
import ComUtil from "~/util/ComUtil";
import {RiFileExcel2Line, RiDeleteBinLine} from 'react-icons/ri'
import ExcelUtil from "~/util/ExcelUtil";
import {MdKeyboardArrowDown, MdKeyboardArrowUp} from 'react-icons/md'
import {AiOutlineEye, AiOutlineEyeInvisible} from 'react-icons/ai'
import styled from "styled-components";
import {TiPin} from 'react-icons/ti'
import {HiOutlineFilter} from 'react-icons/hi'
import DisplayGridRowCount from "./DisplayGridRowCount";

const Wrapper = styled(Div)`
    position: relative;
    & > div {
        display: none;
        position: absolute;
    }
    &:hover {
        & > div {
            display: block;
        }
    }
`;

const HoverBoldLabel = styled(Flex)`
    &:hover {
        font-weight: 700;
    }
`

const FilterContainer = ({gridApi, excelFileName = '목록', open = true, children}) => {
    const [isOpen, setIsOpen] = useState(open)

    const [forceClear, setForceClear] = useRecoilState(allFilterClearState)

    //보이기 / 숨김 상태
    const [columnHide, setColumnHide] = useState(true)
    //그리드에 적용될 column state
    const [columnState, setColumnState] = useState()

    useEffect(() => {
    }, [])

    useEffect(() => {
        if (gridApi) {
            // setGridColumnApi(gridColumnApi)
            //원본 보관
            window.columnState = gridApi.columnController.getColumnState()
            // setColumnState(gridApi.columnController.getColumnState())
            setColumnState(gridApi.columnController.getColumnState())

        }
    }, [gridApi])

    useEffect(() => {
        if (columnState) {
            gridApi.columnController.columnApi.setColumnState(columnState)
        }
    }, [columnState])



    const toggle = () => {
        setIsOpen(!isOpen)
    }

    //recoil 전역변수의 클리어 카운트를 증가시켜 각각 필터 안에서 클리허 하도록 함
    const clear = () => {
        gridApi.setFilterModel(null)
        setForceClear(forceClear+1)
    }

    /*
    * [주의] 엑셀 다운로드시 true, false, number 와 같은 값은 valueGetter, valueFormatter 를 사용해야 정확한 텍스트로 변경시켜 가져 옵니다.
    * cellRenderer 는 무시합니다. 이유는 cellRenderer 내부의 리턴된 값은 다양한 값이 존재 하기 때문에 정확한 value 를 뽑아 낼 수 없음.
    * */
    const excelDownload = (type) => {

        try{

            let fileName;
            const gridRows = []

            /*========================== 그리드(DB원본) 데이터 추출 ==========================*/
            //필터된 데이터 추출
            if (type === 'filtered') {
                fileName = '[현재] ' + excelFileName;
                gridApi.forEachNodeAfterFilterAndSort(function(node, index) {
                    gridRows.push(node.data);
                });
            }
            //원본 데이터
            else if (type === 'origin') {
                fileName = '[전체] ' + excelFileName;
                gridApi.forEachNode((node) => gridRows.push(node.data))
            }

            if (gridRows.length <= 0) {
                alert('다운받을 데이터가 없습니다.')
                return
            }

            /*========================== 엑셀용 헤더, value 추출 ==========================*/
            const headerNames = ['NO']
            const fields = []

            //컬럼정보 가져오기
            const columnDefs = gridApi.getColumnDefs()

            // 엑셀 헤더명 세팅
            columnDefs.map((columnDef) => {
                headerNames.push(columnDef.headerName)
                fields.push(columnDef.field)
            })

            // 엑셀 value 세팅
            //그리드 컬럼에서 field 와 DB 데이터의 key 비교를 통해 value 추출, 그리드 field의 값이 DB key와 매칭되지 않을경우 그리드의 valueGetter, valueFormatter 를 이용해 value 추출
            const oData = gridRows.map((item, index) => {
                const row = [index+1]
                fields.map(field => {
                    let value = item[field]
                    const columnDef = gridApi.getColumnDef(field)

                    try{

                        //현재 그리드 내 params를 수동으로 맞춰 주었음(개선필요)
                        const params = {
                            data: item
                        }

                        //valueGetter 우선
                        if (columnDef.valueGetter && columnDef.hasOwnProperty('valueGetter')) {
                            value = columnDef.valueGetter(params)
                        }

                        //valueFormatter 우선
                        if (columnDef.valueFormatter && columnDef.hasOwnProperty('valueFormatter')) {
                            value = columnDef.valueFormatter(params)
                        }

                    }catch (err){
                        console.log(err)
                    }

                    row.push(value)
                })
                return row
            })

            const dataExcel = [{
                columns: headerNames,
                data: oData
            }];

            ExcelUtil.download(fileName, dataExcel);
        }catch (err) {
            console.error(err)
        }
    }


    //컬럼 숨김 / 보임
    const columnHideToggle = () => {

        const hide = !columnHide

        if (hide) {

            //초기화
            restoreColumnHideState()
            // 숨겨진 원본만 추출
            // const hideColIds =[]
            // window.columnState.map(state => {
            //     if (state.hide === true) {
            //         hideColIds.push(state.colId)
            //     }
            // })
            //
            // //원본에서 hide만 true 로 복구
            // const newColumnState = gridApi.columnController.getColumnState().map(state => {
            //     if (hideColIds.includes(state.colId)) {
            //         state.hide = true
            //     }
            //     return {
            //         ...state
            //     }
            // })
            // setColumnState(newColumnState)

        }else {

            //보이게 할때
            const newColumnState = gridApi.columnController.getColumnState().map(state => {
                return {
                    ...state,
                    hide: false
                }
            })
            setColumnState(newColumnState)
        }

        setColumnHide(hide)
    }

    //colId 로 컬림 숨김/보이기 처리
    const columnHideToggleByColId = (colId) => {
        const newColumnState = gridApi.columnController.getColumnState().map(state => {
            return {
                ...state,
                hide: state.colId === colId ? !state.hide : state.hide
            }
        })

        console.log({colId, newColumnState})
        setColumnState(newColumnState)
    }

    //hide 관련 column state 초기화
    const restoreColumnHideState = () => {

        //원본에서 hide만 true 로 복구
        const newColumnState = gridApi.columnController.getColumnState().map(state => {

            const hide = window.columnState.find(orgState => orgState.colId === state.colId).hide

            return {
                ...state,
                hide: hide
            }
        })
        setColumnState(newColumnState)
    }

    //컬럼 핀 고정
    const onColumnPinnedClick = (columnIndex) => {

        const newColumnState = gridApi.columnController.getColumnState().map((state, index) => {
            const newState = {...state}
            if (index === columnIndex) {
                newState.pinned = !(state.pinned || false)
            }
            return newState
        })
        setColumnState(newColumnState)
    }

    const restoreColumnState = () => {
        setColumnState(window.columnState)
    }

    if (!gridApi) {
        // console.error('FilterContainer > gridApi 파라미터가 누락 되었습니다.')
        return null
    }

    return (
        <Div my={10}>
            <Flex justifyContent={'center'} bg={'white'} bc={'light'} bb={0} py={10}>
                <Flex fontSize={12}>
                    <DisplayGridRowCount gridApi={gridApi} />
                    <Button ml={10} bg={'white'} bc={'light'} onClick={toggle}>
                        <Flex>
                            <HiOutlineFilter size={16}/>
                            <Div mx={5}>필터</Div>
                            {isOpen ? <MdKeyboardArrowUp size={16} /> : <MdKeyboardArrowDown size={16} />}
                        </Flex>
                    </Button>
                    <Button ml={10} bg={'white'} bc={'light'} onClick={clear}><Flex><RiDeleteBinLine size={16} /><Div ml={5}>필터 클리어</Div></Flex></Button>


                    {/* hover Button START */}
                    <Wrapper ml={10}>
                        <Button bg={'white'} bc={'light'}
                                width={100}
                                onClick={columnHideToggle}
                                onMouseOver={() => {
                                    console.log('===')
                                    setColumnState(gridApi.columnController.getColumnState())
                                }}
                        >
                            <Flex justifyContent={'center'}>
                                {
                                    columnHide ? <AiOutlineEye size={16}/> : <AiOutlineEyeInvisible size={16}/>
                                }
                                <Div ml={5}>
                                    {
                                        columnHide ? '열 모두보기' : '열 감추기'
                                    }
                                </Div>
                            </Flex>
                        </Button>
                        {/* hover content START */}
                        <Div bg={'white'} bc={'light'} shadow={'lg'} p={20} minWidth={300} lineHeight={25} zIndex={99}>
                            <GridColumns repeat={2} colGap={10} mb={5}>
                                <Button py={5} block bg={'white'} bc={'light'} onClick={restoreColumnHideState} >숨김 초기화</Button>
                                <Button py={5} block bg={'white'} bc={'light'} onClick={restoreColumnState}>전체 초기화</Button>
                            </GridColumns>
                            {
                                columnState && columnState.map((state, index) => {
                                    const columnDef = gridApi.getColumnDef(state.colId)
                                    // const orgState = window.columnState.find(orgState => orgState.colId === state.colId)
                                    return(
                                        <HoverBoldLabel key={`clearButton_${index}`}
                                                        fg={state.hide ? 'dark' : 'black'}
                                        >
                                            <Div minWidth={25} textAlign={'center'}>{index+1}</Div>
                                            <Flex ml={5} cursor={1} fontSize={16} onClick={columnHideToggleByColId.bind(this, state.colId)}>
                                                {state.hide ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                                            </Flex>
                                            <Div ml={5} lineHeight={24} textAlign={'left'} cursor={1} onClick={columnHideToggleByColId.bind(this, state.colId)}>
                                                {columnDef.headerName}
                                            </Div>
                                            <Flex ml={'auto'} cursor={1} fontSize={18} px={10} fg={state.pinned ? 'green' : 'secondary'} onClick={onColumnPinnedClick.bind(this, index)}>
                                                <TiPin />
                                            </Flex>
                                        </HoverBoldLabel>
                                    )
                                })
                            }
                        </Div>
                    </Wrapper>
                    {/* hover Button END */}
                    <Button ml={10} bg={'white'} bc={'light'} onClick={excelDownload.bind(this, 'origin')}><Flex><RiFileExcel2Line size={16} /><Div ml={5}>다운로드 | 전체</Div></Flex></Button>
                    <Button ml={10} bg={'white'} bc={'light'} onClick={excelDownload.bind(this, 'filtered')}><Flex><RiFileExcel2Line size={16} /><Div ml={5}>다운로드 | 현재</Div></Flex></Button>
                </Flex>
            </Flex>
            <Div display={isOpen ? 'block' : 'none'} bg={'white'}>
                <Div bc={'light'}>
                    {children}
                </Div>
            </Div>
        </Div>
    );
};

export default FilterContainer;
