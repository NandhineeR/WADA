FROM docker:19.03.7-dind

ARG KUBECTL_VERSION=1.27.0
ARG YQ_VERSION=4.40.3
ARG KUSTOMIZE_VERSION=5.0.1
ARG IAM_AUTH_VERSION=0.6.11

ARG NEXUS_USERNAME
ARG NEXUS_PASSWORD

RUN apk add --update --no-cache curl ca-certificates bash jq

# Install YQ
RUN wget https://github.com/mikefarah/yq/releases/download/v${YQ_VERSION}/yq_linux_amd64 -O /usr/bin/yq &&\
    chmod +x /usr/bin/yq

# Install kubectl 
RUN curl -sLO https://storage.googleapis.com/kubernetes-release/release/v${KUBECTL_VERSION}/bin/linux/amd64/kubectl && \
    mv kubectl /usr/bin/kubectl && \
    chmod +x /usr/bin/kubectl

#Install kustomize
RUN curl -sLO https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv${KUSTOMIZE_VERSION}/kustomize_v${KUSTOMIZE_VERSION}_linux_amd64.tar.gz \
    && tar -xf kustomize_v${KUSTOMIZE_VERSION}_linux_amd64.tar.gz \
    && mv kustomize  /usr/bin/kustomize \
    && chmod +x /usr/bin/kustomize

#Install Styra CLI
RUN  curl -sLO -u${NEXUS_USERNAME}:${NEXUS_PASSWORD} https://nexus.wada-ama.org/repository/WADA-DevOps-Packages/styra -o styra \
    && mv styra  /usr/bin/styra \
    && chmod +x /usr/bin/styra 

RUN curl -Lo aws-iam-authenticator  https://github.com/kubernetes-sigs/aws-iam-authenticator/releases/download/v${IAM_AUTH_VERSION}/aws-iam-authenticator_${IAM_AUTH_VERSION}_linux_amd64 \
   && chmod +x ./aws-iam-authenticator \
   && mv aws-iam-authenticator /usr/bin/aws-iam-authenticator
