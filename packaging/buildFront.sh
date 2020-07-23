#!/bin/bash

workingDirectory=$(pwd)
echo PWD cmd: $workingDirectory
if [ $(pwd | grep -o '[^/]*$') = "packaging" ]
then
	cd ..
	workingDirectory=$(pwd)
	echo PWD cmd: $workingDirectory
fi
if [ ! -d $workingDirectory/delivery ]
then 
	mkdir $workingDirectory/delivery
fi
if [ -d $workingDirectory/delivery/site ]
then 
	echo 'removing '$workingDirectory/delivery/site' ...'
	rm -rf $workingDirectory/delivery/site
fi
mkdir $workingDirectory/delivery/site
parameters=''
if [ $1 != '' ]
then 
	parameters=' -c '$1
fi
npm install
ng build $parameters