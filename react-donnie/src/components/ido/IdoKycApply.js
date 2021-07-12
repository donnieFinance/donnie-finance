import React,{useState} from 'react';
import {Div, Span, Flex, Button as StyledButton} from "~/styledComponents/shared";
import { Select, Button, Checkbox } from 'antd';
import {useTranslation} from "react-i18next";
import KycSingleImageUploader from '~/components/common/ImageUploader/KycSingleImageUploader'
import CodeUtil from "~/util/CodeUtil";
import passportManImg from '~/assets/kyc/passport_man.png'
import passportSelfiManImg from '~/assets/kyc/passport_selfi_man.png'
import useSize from "~/hooks/useSize";
import useWallet from "~/hooks/useWallet";
import {idoKYCApply} from '~/lib/idoApi'
import ComUtil from "~/util/ComUtil";
import properties from "~/properties";
const IdoKycApply = (props) => {
    const {idoId,onClose} = props;
    const {t} = useTranslation()
    const {sizeValue} = useSize()
    const {address} = useWallet()
    const countryList = CodeUtil.ConuntryList();
    const [agreement,setAgreement] = useState(false);
    const [kycData,setKycData] = useState({
        idoId:idoId||0,
        account:address,
        countryCode:'',
        passportImage: null,
        selfiImage: null
    })

    // kyc 여권 국가 코드 3자리
    const onCountryChange = (value) => {
        setKycData({...kycData,countryCode:value})
    }
    // kyc 여권 사진
    const onPassportImgChange = async (image) => {
        setKycData({...kycData,passportImage:image})
    }
    // kyc 셀피 여권 사진
    const onSelfiImgChange = (image) =>{
        setKycData({...kycData,selfiImage:image})
    }

    //KYC Apply 버튼의 상태값 리턴
    const getKycApplyButtonErrorText = () => {

        const buttonState = {
            text: '',
            disabled: false
        }

        if (!address){
            buttonState.text = t('connectWallet')
            buttonState.disabled = true
            return buttonState
        }

        buttonState.text = 'KYC APPLY';
        return buttonState
    }

    //kyc 신청
    const onKycApply = async () => {
        if(!address){
            window.$message.warn(`Wallet Address Not Connect!!!`)
            return false;
        }

        if(!kycData.countryCode){
            window.$message.warn(`Country Select!!!`)
            return false;
        }

        if(
            ComUtil.isKycNotCountryChk(kycData.countryCode)
        ){
            window.$message.warn(`Selected country is KYC forbidden!!!`)
            return false;
        }

        if(kycData.passportImage == null || kycData.passportImage.length == 0){
            window.$message.warn(`Upload passport image!!!`)
            return false;
        }
        if(kycData.selfiImage == null || kycData.selfiImage.length == 0){
            window.$message.warn(`Upload selfie image!!!`)
            return false;
        }

        if(!agreement){
            window.$message.warn(`Check Terms and Conditions!!!`)
            return false;
        }

        // KYC 금지국가:
        // Iran(IRN), Iraq(IRQ),
        // Lebanon(LBN), Libya(LBY),
        // United States of America(USA), United States Minor Outlying Islands(UMI),
        // Singapore(SGP),
        // Korea (Democratic People's Republic of)(PRK)
        // KYC 금지국가 3자리 코드 : IRN,IRQ,LBN,LBY,USA,UMI,SGP,PRK
        const {data:res} = await idoKYCApply(kycData);
        if(res > 0){
            //신청성공일 경우 부모 모달 닫고 서치
            onClose(true);
        }else{
            // 존재하지 않음 -999
            // CSRF 오류 -99
            // 당첨이 안된경우 -91
            // 컨트랙트 기록이 안된경우 -92
            // KYC 이미 신청 하신 경우 -93
            // KYC 인증이 된경우 -94
            let msg = "";
            if(res == -999){msg="empty [-999]"}
            else if(res == -99){msg="csrf [-99]"}
            else if(res == -91){msg="not whitelist [-91]"}
            else if(res == -92){msg="not contract [-92]"}
            else if(res == -93){msg="kyc already applied [-93]"}
            else if(res == -94){msg="already kyc done [-94]"}

            if(msg) window.$message.warn(`Error(${msg})`)
            else window.$message.warn(`Error`)
        }
    }

    const onTermsAgrreeCheckBoxChange = (e) => {
        //console.log(`checked = ${e.target.checked}`);
        setAgreement(e.target.checked);
    }

    const buttonState = getKycApplyButtonErrorText();

    return (
        <Flex justifyContent={'center'} mb={50}>
            <Div width={sizeValue(436, null, '95%')} minHeight={721}>
                <Div bg={'white'} minHeight={400} rounded={10} shadow={'lg'}>
                    <Div>
                        {/*<Div bold bg={'white'} p={5}>*/}
                        {/*    KYC Registration*/}
                        {/*</Div>*/}
                        <Div bg={'white'} p={5}>
                            <Div>
                                1. Choose Passport Country
                            </Div>
                            <Div>
                                <Select
                                    showSearch
                                    style={{ minWidth: '100%' }}
                                    placeholder="Country to Select"
                                    defaultValue={kycData && kycData.countryCode||null}
                                    onChange={onCountryChange}
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    filterSort={(optionA, optionB) =>
                                        optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                                    }
                                >
                                    {
                                        countryList.map((item)=>{
                                            return (
                                                <Select.Option value={item['value']}>{item['name']}</Select.Option>
                                            )
                                        })
                                    }
                                </Select>
                            </Div>
                        </Div>
                        <Div bg={'white'} p={5}>
                            <Div mt={10}>
                                2. Upload your passport photo
                            </Div>
                            <Div p={5}>
                                <img src={passportManImg} width={'100%'}/>
                            </Div>
                            <Div p={5} textAlign={'center'}>
                                <Flex justifyContent={'center'}>
                                    <KycSingleImageUploader
                                        account={kycData && kycData.account}
                                        idoId={kycData && kycData.idoId}
                                        kycTitle={'Passport File'}
                                        onChange={onPassportImgChange}/>
                                </Flex>
                            </Div>
                            <Div pt={5} mt={10}>
                                3. Upload your Selfie holding passport
                            </Div>
                            <Div p={5}>
                                <img src={passportSelfiManImg} width={'100%'}/>
                            </Div>
                            <Div p={5}>
                                <Flex justifyContent={'center'}>
                                    <KycSingleImageUploader
                                        account={kycData && kycData.account}
                                        idoId={kycData && kycData.idoId}
                                        kycTitle={'Selfie File'}
                                        onChange={onSelfiImgChange} />
                                </Flex>
                            </Div>
                        </Div>
                        <hr/>
                        <Div p={10} fontSize={12}>
                            Countries not supported: <br/>
                            Afghanistan, Albania, Belarus, Bosnia and Herzegovina, Burundi, Burma, Canada, China, Korea (Democratic People's Republic of), Democratic Republic of Congo, Cuba, Ethiopia, Guinea-Bissau, Guinea, Iran, Iraq, Japan, Liberia, Lebanon, Libya, Macedonia, Malaysia, New Zealand, Serbia, Sri Lanka, Sudan, Somalia, Syria, Thailand, Trinidad and Tobago, Tunisia, Uganda, Ukraine, United States of America, Venezuela, Yemen, Zimbabwe. <br/>
                            For users from other countries, please check and make sure your participation in the token sale on Startup complies with local laws and regulations.
                        </Div>
                        <Div p={10} >
                            <Checkbox onChange={onTermsAgrreeCheckBoxChange} checked={agreement}>
                                4. Click here to indicate that you have read and agree to the terms presented in the <a href={`${properties.TermsOfUseLink}`} target="_black" fg={'blue'}>Terms and Conditions agreement</a>
                            </Checkbox>
                        </Div>
                        <Div p={10} bg={'white'} textAlign={'right'} fontSize={16}>
                            {/*<Button rounded={2} bg={'info'} bc={'background'} px={13} py={8} onClick={this.onClose}>취소</Button>*/}
                            <StyledButton bg={'primary'} fg={'white'} rounded={3} px={10} py={5} onClick={onKycApply} disabled={buttonState.disabled} >
                                {buttonState.text}
                            </StyledButton>
                        </Div>
                    </Div>
                </Div>
            </Div>
        </Flex>
    );
};
export default IdoKycApply;