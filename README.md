# kubefctl

kubefctl (Kubernetes Federation Control) is a Node.js built command tool with `kubectl` and `kubemci`, the main purpose is providing a more friendly interface to deploy multi-cluster applications on Google Kubernetes Engine(GKE).

**NOTE: This repository is WIP(Work In Progress)**

## Requirement
* kubectl
* kubemci
* gcloud
* Node.js 8+
* Node.js packages manager you like
* go 1.9+
* git

## Before installing
Build kubemci with golang, kubemci is not a part of google-sdk at this moment.
```bash
git clone https://github.com/GoogleCloudPlatform/k8s-multicluster-ingress.git
cd k8s-multicluster-ingress
go build -a -installsuffix cgo cmd/kubemci/kubemci.go
chmod +x ./kubemci
ln -s $(PWD)/kubemci /usr/local/bin/kubemci
```

## Install
```bash
npm install --global kubefctl
```
