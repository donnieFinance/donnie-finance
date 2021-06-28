import React, {useEffect, useState} from 'react';
import Checkbox from "~/components/common/checkboxes/Checkbox";
import {Div, Flex, Button} from "~/styledComponents/shared";
import {MdClear} from 'react-icons/md'
import {useRecoilState} from "recoil";
import {allFilterClearState} from "~/hooks/atomState";

/*
   [체크 박스 필터] 사용법

    <CheckboxFilter
        gridApi={this.gridApi}
        field={'payMethod'}
        name={'결제수단'}
        data={[
            {value: 'bly', name: '블리'},
            {value: 'cardBly', name: '카드+블리'},
            {value: 'card', name: '카드'},
        ]}
    />
*/
const CheckboxFilter = ({gridApi, field, name, data}) => {

    const [checkedValues, setCheckedValues] = useState([])
    const [forceClear] = useRecoilState(allFilterClearState)

    //필터 강제클리어
    useEffect(() => {
        onClearClick()
    }, [forceClear])

    const onChange = (value, {target}) => {

        const {checked} = target

        let newValues = Object.assign([], checkedValues)

        //체크되면 추가
        if (checked) {
            newValues.push(value)
        }else{
            //체크 해제시 제거
            const idx =  checkedValues.indexOf(value)
            newValues.splice(idx,1)
        }

        setCheckedValues(newValues)

        console.log({newValues})


        if (newValues.length <= 0) {
            gridApi.destroyFilter(field)
            // const model = gridApi.getFilterInstance(field);
            // console.log("model==",model)
            // model.destroy()
            return
        }


        const newFilter = {
            filterType: 'text'
        }

        if (newValues.length === 1) {
            newFilter.filter = newValues[0].toString()
            newFilter.type = 'equals'
        }else{
            newFilter.operator = 'OR'

            newValues.map((value, index) => {
                newFilter[`condition${index+1}`] = {filter: value.toString(), filterType: 'text', type: 'equals'}
            })
        }

        const newFilterWrap = {
            [field]: newFilter
        }

        setGridFilter(newFilter)

    }

    const setGridFilter = (filter) => {
        const model = gridApi.getFilterModel();

        const newModel = {
            ...model,
            [field]: filter
            // payMethod: {
            //     condition1: {filter: 'bly', filterType: 'text', type: 'equals'},
            //     condition2: {filter: 'card', filterType: 'text', type: 'equals'},
            //     operator: 'OR',
            //     filterType: 'text'
            // }
        }
        console.log("newModal ====", newModel)
        gridApi.setFilterModel(newModel)
    }

    const onClearClick = () => {
        setCheckedValues([])
        gridApi.destroyFilter(field)
    }

    if (!gridApi) {
        // console.error('CheckboxFilter > gridApi 파라미터가 누락 되었습니다.')
        return null
    }

    return (
        <Flex fontSize={12} mr={10} mb={10} bc={'light'}
            // p={5}
              rounded={5} >
            <Flex py={5} pl={10}>
                <Div bold>{name}</Div>
                <Flex ml={10}>
                    {
                        data.map(({value, name}, index) =>
                            <Div key={`checkbox_${index}`} mr={10}>
                                <Checkbox bg={'green'} checked={checkedValues.includes(value)} disabled={checkedValues.length >= 2 && !checkedValues.includes(value)} onChange={onChange.bind(this, value)} value={value}>{name}</Checkbox>
                            </Div>
                        )
                    }
                </Flex>
            </Flex>
            <Div width={32} height={32} bc={'light'} bt={0} br={0} bb={0}>
                <Button block height={'100%'} bg={'white'} onClick={onClearClick}>
                    <MdClear />
                </Button>
            </Div>
        </Flex>

    );
};

export default CheckboxFilter;
