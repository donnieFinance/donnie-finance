import React, {useState, useEffect} from 'react';
import {Flex, Div, Input, Button, Right} from "~/styledComponents/shared";
import {MdClear} from 'react-icons/md'
import {RiFileExcel2Line, RiDeleteBinLine} from 'react-icons/ri'
import {BsList} from 'react-icons/bs'
import styled from 'styled-components'
import {color} from "~/styledComponents/Properties";
import useModal from "~/hooks/useModal";

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
`
const StyledClearLabel = styled(Flex)`
    &:hover {
        // color: ${color.green};
        font-weight: 700;
    }
`;

const ClearButton = ({columns, filterData, onClick, onClearOneClick, onFilterValueClick, gridApi}) => {

    const [data, setData] = useState([])
    const [isOpen, setModalOpen, selected, setSelected, setIsOpen] = useModal()


    useEffect(() => {
        if (columns && columns.length > 0) {
            const model = gridApi.getFilterModel()
            const newData = []
            Object.values(columns).map(({field, name}, index) => {
                const filter = model.hasOwnProperty(field) ? model[field].filter : ''
                newData.push({
                    field: field,
                    name: name,
                    filter: filter
                })
            })
            setData(newData)
        }
    }, [filterData])

    //마우스 올렸을 때 그리드에서 필터링 하고있는것 추출
    const onMouseOver = () => {
        const model = gridApi.getFilterModel()
        const newData = []
        Object.values(columns).map(({field, name}, index) => {
            const filter = model.hasOwnProperty(field) ? model[field].filter : ''
            newData.push({
                field: field,
                name: name,
                filter: filter
            })
        })
        setData(newData)
    }

    return (
        <Wrapper ml={10}>
            <Button bg={'white'} bc={'light'} onMouseOver={onMouseOver} onClick={onClick}>
                <Flex>
                    <RiDeleteBinLine size={16}/><Div ml={5}>클리어</Div>
                </Flex>
            </Button>
            <Div bg={'white'} bc={'light'} shadow={'lg'} p={20} minWidth={300} lineHeight={25} zIndex={99}>
                <Div>필터링 적용 값</Div>
                {
                    data.map(({field, name, filter}, index) =>
                        <Flex dot key={`clearButton_${index}`} fg={filter ? 'danger' : 'black'}>
                            <StyledClearLabel onMouseOver={onFilterValueClick.bind(this, field)}
                                              onClick={onFilterValueClick.bind(this, field)}
                                              cursor={1} lineHeight={24}>
                                <Div minWidth={100} textAlign={'left'}>{name}</Div>
                                <Div>{filter}</Div>
                            </StyledClearLabel>
                            {
                                filter && (
                                    <Right fg={'black'} cursor={1} onClick={onClearOneClick.bind(this,  field)}>
                                        <MdClear/>
                                    </Right>
                                )
                            }
                        </Flex>
                    )
                }
            </Div>
        </Wrapper>
    );
};

export default ClearButton;
