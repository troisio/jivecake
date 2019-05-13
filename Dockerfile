FROM centos:7

ENV SOURCE_DIRECTORY /root/jivecake

ADD docker/init.sh /init.sh
ADD docker/nginx.conf /root/nginx.conf
ADD . $SOURCE_DIRECTORY

RUN \
    printf "[nginx]\nname=nginx repo\nbaseurl=http://nginx.org/packages/centos/7/x86_64/\ngpgcheck=0\nenabled=1" >> /etc/yum.repos.d/nginx.repo && \
    yum -y update && \
    yum install -y wget nginx-1.14.0 git-all curl nano which man manpages && \

    curl --silent --location https://rpm.nodesource.com/setup_10.x | bash - && \
    yum -y install nodejs && \
    npm install -g yarn && \
    chmod +x /init.sh && \
    cd $SOURCE_DIRECTORY && \
    yarn && \
    npm run build && \
    nginx -c /root/nginx.conf

CMD /init.sh
