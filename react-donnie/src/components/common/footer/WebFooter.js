import React from 'react';
import {Button, Div, Flex, Img} from "~/styledComponents/shared";
import properties from "~/properties";
import {withTranslation} from "react-i18next";

const WebFooter = ({t, iconList}) => {
    return (
        <Flex flexWrap={'no-wrap'} bg={'darkPrimary'} fg={'white'} p={20}>
            <Div flexGrow={1}>
                <Div>ⓒ DONNIE FINANCE. ALL RIGHTS RESERVED.</Div>
                <Div>powered by IOST</Div>
            </Div>
            <Flex ml={'auto'} flexShrink={0}>
                <Div mr={20}>
                    <a
                        href={`https://www.iostabc.com/token/${properties.address.token}`}
                        target="_black"
                    >
                        <Button fg={'light'} bc={'secondary'} bg={'darkPrimary'} px={15} py={10} rounded={4}>Token Contract</Button>
                    </a>
                    <a
                        href={'https://drive.google.com/file/d/1Wgu773VlOyiAcpD1X8m6YYdQIu4y13PE/view?usp=sharing'}
                        target="_black"
                    >
                        <Button fg={'light'} bc={'secondary'} bg={'darkPrimary'} px={15} py={10} rounded={4} ml={10}>White
                            Paper</Button>
                    </a>

                </Div>
                <Flex ml={'auto'} mt={3}>
                    {
                        iconList.map(icon =>
                            <a href={icon.link} target={'_blank'}>
                                <Img src={icon.img} alt={''} width={33}/>
                            </a>
                        )
                    }
                </Flex>
            </Flex>
        </Flex>
    );
};

export default withTranslation()(WebFooter);
