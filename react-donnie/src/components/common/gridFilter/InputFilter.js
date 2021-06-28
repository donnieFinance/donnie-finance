import React, {useState, useEffect, useRef} from 'react';
import {Flex, Div, Input, Button, GridColumns} from "~/styledComponents/shared";
import Checkbox from "~/components/common/checkboxes/Checkbox";
import {MdClear} from 'react-icons/md'

import ClearButton from "~/components/common/gridFilter/ClearButton";
import {useRecoilState} from "recoil";
import {allFilterClearState} from "~/hooks/atomState";
import {color} from "~/styledComponents/Properties";
import styled from 'styled-components'
const StyledInput = styled(Input)`
    &:focus {
        border: 1px solid ${color.danger};
    }
`

/*

   [인풋 박스 필터] 사용법

    <InputFilter
        gridApi={this.gridApi}
        columns={[
            {field: 'consumerNm', name: '주문자명'},
            {field: 'goodsNm', name: '상품명'},
            {field: 'consumerEmail', name: '이메일'},
            {field: 'consumerPhone', name: '주문자 전화번호'},
        ]}
        isRealTime={true}
    />
*/
const InputFilter = ({columns, gridApi, isRealTime}) => {
    const [filterData, setFilterData] = useState(columns)
    const [checked, setChecked] = useState(isRealTime)
    const [forceClear] = useRecoilState(allFilterClearState)

    const inputRefs = useRef([])

    useEffect(() => {
        setFilterData(getInitialFilterData())
    }, [])

    //필터 강제클리어
    useEffect(() => {
        clearFilterData()
    }, [forceClear])


    const getInitialFilterData = () => {
        const initialFilterData = {}
        columns.map(({field, name}) => {
            initialFilterData[field] = ''
        })

        return initialFilterData
    }

    const onChange = ({target}) => {
        const {name, value} = target
        setFilterData({
            ...filterData,
            [name]: value
        })

        //실시간 조회가 체크 되어 있으면 필터링 호출
        if (checked) {
            setGridFilter({
                [name]: {
                    filterType: 'text',
                    type: 'contains',//equals, notEqual, contains, notContains, startsWith, endsWith
                    filter: value,
                    filterText: 'string'
                }
            })
        }

    }

    const onKeyPress = (e) => {
        if (e.key === 'Enter') {
            const {name, value} = e.target
            setGridFilter({
                [name]: {
                    filterType: 'text',
                    type: 'contains',//equals, notEqual, contains, notContains, startsWith, endsWith
                    filter: value,
                    filterText: 'string'
                }
            })
        }
    }

    const onFocus = (index, e) => {
        inputRefs.current[index].select()
    }

    const onFilterValueClick = (field) => {
        const index = columns.findIndex(column => column.field === field)
        inputRefs.current[index].select()
    }

    const setGridFilter = (filter) => {
        const model = gridApi.getFilterModel();
        console.log({model})
        gridApi.setFilterModel({
            ...model,
            ...filter
        })
    }

    //체크박스 변경시
    const onCheckboxChange = ({target}) => {
        setChecked(target.checked)
    }

    //클리어
    const onClearClick = (name) => {
        setFilterData({
            ...filterData,
            [name]: ''
        })

        gridApi.destroyFilter(name)

        // setGridFilter({
        //     [name]: {
        //         filterType: 'text',
        //         type: 'contains',//equals, notEqual, contains, notContains, startsWith, endsWith
        //         filter: '',
        //         filterText: 'string'
        //     }
        // })
    }

    //전체 클리어
    const onClearAllClick = () => {
        setFilterData(getInitialFilterData())
        gridApi.setFilterModel(null)
    }

    //강제 필터 state 리셋
    const clearFilterData = () => {
        const newFilterData = Object.assign({}, filterData)
        Object.keys(newFilterData).map(key => newFilterData[key] = '')
        setFilterData(newFilterData)
    }


    if (!gridApi) {
        // console.error('InputFilter > gridApi 파라미터가 누락 되었습니다.')
        return null
    }
    if (!columns) {
        // console.error('InputFilter > columns 파라미터가 누락 되었습니다.')
        return null
    }

    return (
        <Flex fontSize={12} alignItems={'flex-start'}>
            <Flex flexShrink={0}>
                <Flex>
                    <Checkbox bg={'green'} onChange={onCheckboxChange} checked={checked} size={'sm'}>실시간</Checkbox>
                </Flex>
                <ClearButton gridApi={gridApi} columns={columns} filterData={filterData}
                             onClick={onClearAllClick}
                             onClearOneClick={onClearClick}
                             onFilterValueClick={onFilterValueClick}
                >
                </ClearButton>
            </Flex>
            <Flex flexWrap={'wrap'}>
                {
                    columns.map(({field, name, width = 100}, index) =>
                        <Flex ml={10} mb={10}>
                            <Div mr={10} flexShrink={0}>{name}</Div>
                            <StyledInput
                                name={field}
                                width={width}
                                height={30}
                                value={filterData[field]}
                                rounded={0}
                                onChange={onChange}
                                onKeyPress={onKeyPress}
                                onFocus={onFocus.bind(this, index)}
                                ref={(el) => inputRefs.current[index] = el}
                            />
                            <Button height={'100%'} bg={'white'} onClick={onClearClick.bind(this,  field)}>
                                <Flex><MdClear/></Flex>
                            </Button>
                        </Flex>
                    )
                }
            </Flex>
        </Flex>
    );
};

export default InputFilter;
