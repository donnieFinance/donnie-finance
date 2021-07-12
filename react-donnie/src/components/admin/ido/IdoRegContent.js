import React, { useState, useEffect } from 'react'
import {Div, Flex} from '~/styledComponents/shared'
import styled from 'styled-components'
import {Button, Input, Select} from 'antd'
import AdminApi from '~/lib/adminApi'

const StyledInputNumber = styled(Input)`
    & input {
        height: 40px;
    } 
`;

// IDO 등록 및 수정 컨텐트
const IdoRegContent = (props) => {

    const [data,setData] = useState(
        {
            idoId:props.idoId ? props.idoId:0,
            idoName:"",
            idoToken:"",
            idoUrl:"",
            displayFlag:true,
            maxWhitelistCount:0,
            whitelistContractId:"",
            buyIdoContractId:"",
            drawFlag:0
        }
    )

    useEffect(() => {
        search()
    }, [])

    const search = async () => {
        if(data.idoId > 0) {
            const {data:dataInfo} = await AdminApi.getIdo(data.idoId);
            if (dataInfo) {
                setData(dataInfo);
            }
        }
    }

    const onIdoNameChange = ({target}) => {
        const {value} = target
        setData({...data,idoName:value});
    }
    const onIdoTokenChange = ({target}) => {
        const {value} = target
        setData({...data,idoToken:value});
    }
    const onIdoUrlChange = ({target}) => {
        const {value} = target
        setData({...data,url:value});
    }
    const onSelectChange = (value) => {
        setData({...data,displayFlag:value});
    }
    const onMaxWhitelistCountChange = ({target}) => {
        const {value} = target
        setData({...data,maxWhitelistCount:value});
    }
    const onWhitelistContractIdChange = ({target}) => {
        const {value} = target
        setData({...data,whitelistContractId:value});
    }
    const onBuyIdoContractIdChange = ({target}) => {
        const {value} = target
        setData({...data,buyIdoContractId:value});
    }

    const onIdoSave = async () => {
        if(!data.idoName){
            alert("IDO명은 필수항목입니다!")
            return false;
        }
        if(!data.idoToken){
            alert("IDO Token은 필수항목입니다!")
            return false;
        }
        if(data.maxWhitelistCount <= 0){
            alert("MaxWhitelistCount은 필수항목입니다!")
            return false;
        }
        if(!data.whitelistContractId){
            alert("WhitelistContractID 필수항목입니다!")
            return false;
        }
        if(!data.buyIdoContractId){
            alert("BuyIdoContractId 필수항목입니다!")
            return false;
        }
        const params = data;
        //ido 저장
        const {data:result} = await AdminApi.setIdo(params)
        if(result > 0){
            alert("IDO 저장이 되었습니다!")
            props.onClose(true);
        }
    }

    return (
        <Div p={24}>
            {
                data.idoId > 0 &&
                <Div mb={5}>
                    <Div>IDO ID : {data.idoId}</Div>
                </Div>
            }
            {
                data.drawFlag > 0 &&
                <Div mb={5}>
                    <Div>추첨배치실행 : {data.drawFlag === 2 ? "추첨완료":"추첨중"}</Div>
                </Div>
            }
            <Div p={16} shadow={'md'} bc={'light'}>
                <Div mb={5}>
                    <Div>IDO 명</Div>
                    <Flex>
                        <Input name={'idoName'}
                               placeholder={"IDO 명"}
                               size={'large'}
                               value={data.idoName}
                               onChange={onIdoNameChange}/>
                    </Flex>
                </Div>
                <Div mt={10} mb={5}>
                    <Div>IDO 토큰</Div>
                    <Flex>
                        <Input name={'idoToken'}
                               placeholder={"IDO 토큰"}
                               size={'large'}
                               value={data.idoToken}
                               onChange={onIdoTokenChange}
                        />
                    </Flex>
                </Div>
                {/*<Div mt={10} mb={5}>*/}
                {/*    <Div>참조정보 URL</Div>*/}
                {/*    <Flex>*/}
                {/*        <Input name={'url'}*/}
                {/*               placeholder={"참조정보 URL"}*/}
                {/*               size={'large'}*/}
                {/*               value={data.url}*/}
                {/*               onChange={onIdoUrlChange}*/}
                {/*        />*/}
                {/*    </Flex>*/}
                {/*</Div>*/}
                {/*<Div mt={10} mb={5}>*/}
                {/*    <Div>노출여부</Div>*/}
                {/*    <Flex>*/}
                {/*        <Select defaultValue={data.displayFlag} value={data.displayFlag} style={{ width: '100%' }} onChange={onSelectChange}>*/}
                {/*            <Select.Option value={true}>Y</Select.Option>*/}
                {/*            <Select.Option value={false}>N</Select.Option>*/}
                {/*        </Select>*/}
                {/*    </Flex>*/}
                {/*</Div>*/}
                <Div mt={10} mb={5}>
                    <Div>MaxWhiteListCount</Div>
                    <Flex>
                        <StyledInputNumber
                            type={'number'}
                            name={'maxWhitelistCount'}
                            placeholder={"MaxWhiteListCount"}
                            size={'large'}
                            style={{height: 40}}
                            block
                            value={data.maxWhitelistCount}
                            onChange={onMaxWhitelistCountChange}
                        />
                    </Flex>
                </Div>
                <Div mt={10} mb={5}>
                    <Div>WhiteListContractID</Div>
                    <Flex>
                        <Input name={'whitelistContractID'}
                               placeholder={"WhiteListContractID"}
                               size={'large'}
                               value={data.whitelistContractId}
                               onChange={onWhitelistContractIdChange}
                        />
                    </Flex>
                </Div>
                <Div mt={10} mb={5}>
                    <Div>BuyIDOContractID</Div>
                    <Flex>
                        <Input name={'buyIdoContractId'}
                               placeholder={"BuyIDOContractID"}
                               size={'large'}
                               value={data.buyIdoContractId}
                               onChange={onBuyIdoContractIdChange}
                        />
                    </Flex>
                </Div>
            </Div>
            <Div mt={10}>
                <Button type='primary' block onClick={onIdoSave}>저장</Button>
            </Div>
        </Div>
    )
}
export default IdoRegContent;