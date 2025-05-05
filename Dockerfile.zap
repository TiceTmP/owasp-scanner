FROM zaproxy/zap-stable

RUN /zap/zap.sh -cmd -addoninstall ascanrules
RUN /zap/zap.sh -cmd -addoninstall pscanrules
RUN /zap/zap.sh -cmd -addoninstall openapi

EXPOSE 9000

# ใช้ค่า API key โดยตรงแทนที่จะพยายามอ้างถึงตัวแปร environment
CMD ["zap-x.sh", "-daemon", "-host", "0.0.0.0", "-port", "9000", "-config", "api.disablekey=false", "-config", "api.addrs.addr.name=.*", "-config", "api.addrs.addr.regex=true", "-config", "api.addrs.addr.name.1=172.20.0.0/16", "-config", "api.addrs.addr.regex.1=false", "-config", "api.addrs.addr.name.2=backend", "-config", "api.addrs.addr.regex.2=false", "-config", "api.key=thiskeyforzapbyticetmp"]