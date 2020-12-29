import React from 'react';
import {Button, Div, Flex, Img} from "~/styledComponents/shared";
import properties from "~/properties";
import {withTranslation} from "react-i18next";

const MobileFooter = ({t, iconList}) => {
    return (
        <>
            <Div bg={'darkPrimary'} fg={'white'} p={20}>
                <Div>
                    <a
                        href={`https://www.iostabc.com/token/${properties.address.token}`}
                        target="_black"
                    >
                        <Button block fg={'light'} bc={'secondary'} bg={'darkPrimary'} px={15} py={10} rounded={4} mb={20}>Token Contract</Button>
                    </a>
                    <a
                        href={'https://drive.google.com/file/d/1Wgu773VlOyiAcpD1X8m6YYdQIu4y13PE/view?usp=sharing'}
                        target="_black"
                    >
                        <Button block fg={'light'} bc={'secondary'} bg={'darkPrimary'} px={15} py={10} rounded={4}>White
                            Paper</Button>
                    </a>
                </Div>
                <Flex justifyContent={'center'} mt={33}>
                    {
                        iconList.map((icon, i) =>
                            <a href={icon.link} target={'_blank'}>
                                <Img src={icon.img} alt={''} width={33} ml={i !== 0 && 10}/>
                            </a>
                        )
                    }
                </Flex>
                <Div textAlign={'center'} mt={10}>
                    <Div>ⓒ DONNIE FINANCE. ALL RIGHTS RESERVED.</Div>
                    <Div>powered by IOST</Div>
                </Div>
            </Div>
        </>
    );
};

export default withTranslation()(MobileFooter);
