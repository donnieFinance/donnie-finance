import React from 'react';
import packageJson from '../package.json';
global.appVersion = packageJson.version;

// version from response - first param, local version second param
const semverGreaterThan = (versionA, versionB) => {
    const versionsA = versionA.split(/\./g);

    const versionsB = versionB.split(/\./g);
    while (versionsA.length || versionsB.length) {
        const a = Number(versionsA.shift());

        const b = Number(versionsB.shift());
        // eslint-disable-next-line no-continue
        if (a === b) continue;
        // eslint-disable-next-line no-restricted-globals
        return a > b || isNaN(b);
    }
    return false;
};
/*
React 앱 캐시 무효화
 캐싱만큼이나 대단합니다. 캐시 무효화는 오랫동안 어려움을 겪었습니다.
 다양한 유형의 웹 사이트에서 작동하는 다양한 접근 방식이 있습니다.
 최근에 새 버전이 출시 될 때마다 웹 앱의 캐시를 무효화해야했습니다.
 몇 가지 접근 방식을 시도한 후 매번 작동하는 것으로 입증 된 접근 방식으로 정착했습니다.

- 새 버전이없는 경우 사이트가 캐시에서로드되기를 원합니다.
- 새 버전의 앱이 배포 될 때마다 캐시를 새로 고치고 싶습니다.
- npm 패키지 버전 관리를 사용하여 앱의 버전을 지정하고 각 배포는 점진적으로 버전이 지정됩니다.
- meta.json공개 디렉토리의 모든 빌드와 함께 파일을 생성하고 REST 엔드 포인트로 작동합니다 (브라우저에 캐시되지 않음).
- window.location.reload(true)새 버전이 출시 될 때마다 브라우저의 캐시 ( )를 새로 고 칩니다.
*/

class CacheBuster extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            isLatestVersion: false,
            refreshCacheAndReload: () => {
                console.log('Clearing cache and hard reloading...')
                if (caches) {
                    // Service worker cache should be cleared with caches.delete()
                    caches.keys().then(function(names) {
                        for (let name of names) caches.delete(name);
                    });
                }

                // delete browser cache and hard reload
                window.location.reload(true);
            }
        };
    }

    componentDidMount() {
        fetch('/meta.json')
            .then((response) => response.json())
            .then((meta) => {
                const latestVersion = meta.version;
                const currentVersion = global.appVersion;

                const shouldForceRefresh = semverGreaterThan(latestVersion, currentVersion);
                if (shouldForceRefresh) {
                    console.log(`We have a new version - ${latestVersion}. Should force refresh`);
                    this.setState({ loading: false, isLatestVersion: false });
                } else {
                    console.log(`You already have the latest version - ${latestVersion}. No cache refresh needed.`);
                    this.setState({ loading: false, isLatestVersion: true });
                }
            });
    }
    render() {
        const { loading, isLatestVersion, refreshCacheAndReload } = this.state;
        return this.props.children({ loading, isLatestVersion, refreshCacheAndReload });
    }
}

export default CacheBuster;