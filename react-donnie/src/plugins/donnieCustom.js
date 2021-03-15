import properties from "~/properties";

// 무조건 출력되는 로그
console.slog = console.log

// 일반 로그는 live 일 경우 보이지 않게 처리함
if (properties.isTestMode !== true)
    console.log = () => {};