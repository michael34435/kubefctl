# kubefctl

kubefctl (Kubernetes Federation Control) is a Node.js built command tool with `kubectl` and `kubemci`, the main purpose is providing a more friendly interface to deploy multi-cluster applications on Google Kubernetes Engine(GKE).

**You have make sure you login with your GKE account with `application-default` or kubemci won't work as expected.**

## Requirement
* kubectl
* kubemci
* gcloud
* Node.js 8+
* Node.js packages management tool you like
* go 1.9+
* git

## Before installing
Build kubemci with golang, kubemci is not a part of google-sdk at this moment.
```bash
go get -u github.com/GoogleCloudPlatform/k8s-multicluster-ingress/cmd/kubemci
```

## Install via NPM
```bash
npm install --global kubefctl
```

## Install via yarn
```bash
yarn global add kubefctl
```
