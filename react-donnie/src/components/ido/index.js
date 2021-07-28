import React, {useEffect, useState} from 'react';
import {Button, Div, Span, Flex, GridColumns, Hr, Right, Link, A} from "~/styledComponents/shared";
import PageHeading from "~/components/common/layouts/PageHeading";
import {withTranslation} from "react-i18next";
import useModal from "~/hooks/useModal";
import {HiOutlineTicket} from "react-icons/hi"
import {FaChevronDown, FaChevronUp, FaTelegram} from "react-icons/fa";
import loadable from "@loadable/component";
import properties from "~/properties";
import useSize from "~/hooks/useSize";
import idoApi from "~/lib/idoApi";
import iostApi from "~/lib/iostApi";
import useWallet from "~/hooks/useWallet";
import WalletUtil from "~/util/WalletUtil";
import useInterval from "~/hooks/useInterval";
import {BsFillQuestionCircleFill, BsFillExclamationTriangleFill} from "react-icons/bs";
import {Space, Tooltip} from "antd";
import {RiCoupon3Line} from 'react-icons/ri'
import {color} from "~/styledComponents/Properties";
import styled from 'styled-components'
import {getValue} from "~/styledComponents/Util";
import useIdoTicketBalance from "~/hooks/useIdoTicketBalance";
import {FaTelegramPlane, FaTwitter, FaMediumM, FaLink} from 'react-icons/fa'
import witch_project_banner from '~/assets/ido/witch_project_banner.jpg'
import etherscan_icon from '~/assets/etherscan-logo.svg'
import ComUtil from "~/util/ComUtil";
const IdoTicketCard = loadable(() => import('~/components/common/layouts/IdoTicketCard'))
const IdoCard = loadable(() => import('~/components/common/layouts/IdoCard'))



const DotText = styled(Div)`
    position: relative;
    padding-left: 15px;
    &::after{
        content: "";
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: ${color.donnie};        
    }
`

function ProcessCircle({circleLeft, textTop, textLeft = 0, children}) {
    return(
        <>
            <Div absolute left={`${circleLeft}%`} top={'50%'} width={15} height={15} rounded={'50%'} bc={'donnie'} bw={2} bg={'white'} custom={` transform: translate(-50%, -50%); `}></Div>
            <Div absolute left={`${circleLeft + textLeft}%`} top={textTop} width={'max-content'}  custom={`transform: translate(-50%, -50%);`}>{children}</Div>
        </>
    )
}


function ProcessLineWeb() {
    return(
        <>
            <ProcessCircle circleLeft={0} textTop={30}>Ticket Purchase</ProcessCircle>
            <ProcessCircle circleLeft={25} textTop={30}>Whitelist Survey</ProcessCircle>
            <ProcessCircle circleLeft={50} textTop={30}>Whitelist Draw</ProcessCircle>
            <ProcessCircle circleLeft={75} textTop={30}>KYC </ProcessCircle>
            <ProcessCircle circleLeft={100} textTop={30}>Join IDO </ProcessCircle>
        </>
    )
}
function ProcessLineMobile() {
    return(
        <>
            <ProcessCircle circleLeft={0} textTop={24} textLeft={7}>Ticket Purchase</ProcessCircle>
            <ProcessCircle circleLeft={25} textTop={-20}>Whitelist Survey</ProcessCircle>
            <ProcessCircle circleLeft={50} textTop={24}>Whitelist Draw</ProcessCircle>
            <ProcessCircle circleLeft={75} textTop={-20}>KYC </ProcessCircle>
            <ProcessCircle circleLeft={100} textTop={24}>Join IDO</ProcessCircle>
        </>
    )
}



export default withTranslation()((props) => {
    const {t} = props;

    const tMenu = t('menu', {returnObjects: true});
    const tMenuIdo = tMenu.ido;

    const {size, sizeValue} = useSize()

    // !!주의!! 모두 Object 형식임 (Array 아님!)
    const {idoTicketing, idoList} = properties

    // idoTicket state
    const [IdoTicketOpen, setIdoTicketOpen, selected, setSelected, setSwapState, toggleSwap] = useModal();

    const fontSize = {
        title: 20
    }

    const {idoTicketBalance, refetch} = useIdoTicketBalance()

    //Group Project 우측: Closed or Sold Out 용도.
    const Circle = ({bg}) => <Div bg={bg} width={6} height={6} rounded={'50%'} mr={10}></Div>

    return (
        <Div>
            <PageHeading
                title={
                    <Div><Span fg={'white'}>IO</Span><Span fg={'donnie'}>STarter</Span></Div>
                }
                description={tMenuIdo.desc}
            />

            <Flex justifyContent={'center'}>

                <Div relative p={sizeValue(50, null,  20)} minWidth={sizeValue('70%', null, '90%')} width={size === 'sm' && '90%'} bc={'white'} shadow={'lg'} bg={'rgba(0,0,0,0.4)'} rounded={10} fg={'white'}>
                    <Div absolute top={sizeValue(16, null, 10) } right={sizeValue(16, null, 10)}>
                        <A href={'https://donnie-finance.medium.com/how-to-participate-in-iostarter-f19633f9c391'} target={'_blank'} >
                            <Flex cursor={1} bc={'white'} rounded={15} px={15} fg={'white'}
                                  custom={`
                                  transition: 0.2s;
                                    &:hover {
                                        box-shadow: 
                                            0 0 0 5px rgba(255, 255, 255, 50%),
                                            0 0 0 40px rgba(255, 255, 255, 30%);
                                    }
                                  `}
                            >
                                <Div mr={5}>How-To</Div><BsFillQuestionCircleFill />
                            </Flex>
                        </A>
                    </Div>
                    <Div mb={sizeValue(80, null,  50)}>
                        <Div fontSize={fontSize.title} bold>
                            IDO Process
                        </Div>
                        <Flex mt={sizeValue(20, null, 35)} justifyContent={'center'}>
                            <Div width={'90%'} height={1} bg={'donnie'} relative fontSize={sizeValue(15, null,  11)}>
                                {
                                    size === 'sm' ? <ProcessLineMobile /> : <ProcessLineWeb />
                                }
                            </Div>
                        </Flex>
                    </Div>


                    <Div custom={`
                        display: grid;
                        grid-template-columns: ${sizeValue('3fr 1fr', null, '1fr')};                        
                    `} >
                        <Div>
                            <Flex bw={500} fontSize={fontSize.title} bold>
                                <Div height={'70%'} mb={-5} mr={10}>
                                    Ticket weight
                                </Div>
                                {
                                    size === 'sm' && (
                                        <Tooltip
                                            title={<Div bg={'black'}>
                                                {t('ticketDesc')}<br/>
                                                {t('lstDesc')}
                                            </Div>
                                            } placement="top">
                                            <BsFillExclamationTriangleFill />
                                        </Tooltip>
                                    )
                                }

                            </Flex>
                            {
                                size !== 'sm' && (
                                    <Div my={10}>
                                        {t('ticketDesc')}<br/>
                                        {t('lstDesc')}
                                    </Div>
                                )
                            }
                            <Div lighter mt={10}>
                                <GridColumns repeat={sizeValue(2, null, 1)} rowGap={0} colGap={0}>
                                    <Div>
                                        <DotText>1 ticket : 1 ticket weight</DotText>
                                        <DotText>10 ticket : ×1.1 (11 ticket weight)</DotText>
                                        <DotText>30 ticket : ×1.15</DotText>
                                        <DotText>50 ticket : ×1.2</DotText>
                                    </Div>
                                    <Div>
                                        <DotText>70 ticket : ×1.25</DotText>
                                        <DotText>100 ticket : ×1.3</DotText>
                                        <DotText>300 ticket : ×1.4</DotText>
                                        <DotText>500 ticket : ×1.5</DotText>
                                    </Div>
                                </GridColumns>


                            </Div>
                        </Div>
                        {
                            size === 'sm' && <Hr my={20} bc={'lightText'}/>
                        }
                        <Div textAlign={'center'} mb={sizeValue(0, null,  10)}>
                            <Div fontSize={fontSize.title} bold>Your IDO Tickets</Div>
                            <Div fontSize={60} bold>{idoTicketBalance}</Div>
                            <Button bg={'donnie'} rounded={25} px={20} fontSize={fontSize.title} onClick={toggleSwap}>
                                <Flex>
                                    <Div mr={10} bold>Get tickets</Div> {IdoTicketOpen ? <FaChevronUp />:<FaChevronDown />}
                                </Flex>
                            </Button>
                        </Div>

                    </Div>
                    {
                        IdoTicketOpen && (
                            <Div mt={20}>
                                <GridColumns repeat={sizeValue(6,2,1)} colGap={10} rowGap={10}>
                                    {Object.keys(idoTicketing).map(ticketPoolKey =>
                                        <IdoTicketCard
                                            name={ticketPoolKey}
                                            ticketPoolObject = {idoTicketing[ticketPoolKey]}
                                        />)
                                    }
                                </GridColumns>
                            </Div>
                        )
                    }
                </Div>



            </Flex>

            <Flex flexDirection={'column'} justifyContent={'center'} >

                {/* IDO List*/}
                <Flex fg={'white'} fw={500} fontSize={25} mt={55}>
                    <Div width={22} height={22} bc={'white'} rounded={'50%'} bg={'rgba(255,255,255,0.2)'} mt={-5} mr={8}></Div>
                    <Div fontSize={sizeValue(25, null, 20)} >
                        IDO List
                    </Div>
                </Flex>
                <Div  maxWidth={900} mt={sizeValue(15, null,  10)}>
                    {
                        properties.idoGroupList.map(group =>
                            <Div mb={30}>
                                {/* heading */}
                                <Div
                                    relative
                                    custom={`                                     
                                        border-radius: ${size === 'sm' ? '0' : `${getValue(5)} ${getValue(5)} 0 0;`};
                                        background-image: url("${witch_project_banner}");                                        
                                     `}
                                    // bc={'light'} bt={0} bl={0} br={0}
                                >
                                    <Div px={20} pt={30} pb={16}>
                                        <Flex fontSize={22} bold fg={'white'}>
                                            <Div>{group.title}</Div>

                                            {group.closeStatus && ComUtil.isStarted(group.closeTime) &&(
                                                <Flex ml={20} mr={20} bg={'white'} fg={'red'}
                                                      minWidth={80}
                                                      maxWidth={150}
                                                      minHeight={21}
                                                      fontSize={13}
                                                      px={10} style={{borderTopLeftRadius:9, borderTopRightRadius:9, borderBottomLeftRadius:9, borderBottomRightRadius:9}}>

                                                      <Circle bg={'red'} /> {group.closeStatus}

                                                </Flex>
                                            )}


                                            <Right custom={`
                                            & svg:hover {
                                                color: ${color.white};
                                            }
                                        `}>
                                                <Space>
                                                    {
                                                        group.websiteUrl && <A href={group.websiteUrl} target={'_blank'} ><FaLink color={color.white} /></A>
                                                    }
                                                    {
                                                        group.telegramUrl && <A href={group.telegramUrl} target={'_blank'} ><FaTelegramPlane color={color.white} /></A>
                                                    }
                                                    {
                                                        group.twitterUrl && <A href={group.twitterUrl} target={'_blank'} ><FaTwitter color={color.white} /></A>
                                                    }
                                                    {
                                                        group.mediumUrl && <A href={group.mediumUrl} target={'_blank'} ><FaMediumM color={color.white} /></A>
                                                    }
                                                    {
                                                        group.etherScanUrl && <A href={group.etherScanUrl} target={'_blank'} ><img src={etherscan_icon} alt={'ether scan'} width={22} height={22} /></A>
                                                    }
                                                </Space>
                                            </Right>

                                        </Flex>
                                        <Div fontSize={16} mt={5} fg={'white'}>
                                            <Span mr={10}>{group.desc}</Span>
                                            {/*<A href={group.surveyUrl} target={'_blank'} ><Span fw={600} fg={'white'}><u>Please survey</u>🙏</Span></A>*/}
                                        </Div>
                                        <Div textAlign={sizeValue('right', null,  'left') } mt={5}>
                                            <A href={group.surveyUrl} target={'_blank'} >
                                                <Button fg={'#271F75'} bg={'white'} rounded={15} px={13} py={3} shadow={'sm'}
                                                        custom={`
                                                        &:hover {
                                                            box-shadow: 
                                                                0 0 0 5px rgba(255, 255, 255, 50%),
                                                                0 0 0 40px rgba(255, 255, 255, 30%);
                                                        }
                                                    `}
                                                >Whitelist Survey</Button>
                                            </A>
                                        </Div>
                                    </Div>
                                </Div>

                                {/* content */}
                                <Div p={20} bg={'white'}
                                     custom={`                                     
                                        border-radius: ${size === 'sm' ? '0' : `0 0 ${getValue(5)} ${getValue(5)};`};
                                     `}
                                >
                                    <GridColumns repeat={sizeValue(2,null,1)} colGap={20} rowGap={20}>
                                        {
                                            Object.keys(group.list).map(idoKey =>
                                                <IdoCard
                                                    idoKey={idoKey}
                                                    idoObject = {idoList[idoKey]}
                                                />
                                            )
                                        }
                                    </GridColumns>
                                </Div>
                            </Div>
                        )
                    }
                </Div>
                {/*<GridColumns repeat={sizeValue(2,null,1)} colGap={32} rowGap={60} mt={10} mb={100}>*/}
                {/*    {Object.keys(idoList).map(idoKey =>*/}
                {/*        <IdoCard*/}
                {/*            idoKey={idoKey}*/}
                {/*            idoObject = {idoList[idoKey]}*/}
                {/*        />)*/}
                {/*    }*/}
                {/*</GridColumns>*/}

                {/*<Div fontSize={17} mb={50} >*/}
                {/*    <a style={{color: 'white', textDecoration:'underline'}} target={'_blank'} href={'https://www.iostabc.com/contract/Contract5ndTHiqRRPWnT5wBFhQ9bthhueT9LVFnuGgGEVfmVRb8'}>Apply for Project Listing on IOstarter of Donnie.Finance</a>*/}
                {/*</Div>*/}

            </Flex>
        </Div>
    );
});

