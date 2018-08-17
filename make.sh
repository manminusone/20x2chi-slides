#!/bin/bash

# make.sh -- simple bash script to make dev distribution (the default action) and actual distribution
# Created because gnu make doesn't work with spaces in the filenames!


copyfile () {
	if [ ! -e "$1" ];
	then
		echo "Hey, you didn't grab the $3 repo. You need to add the flag"
		echo "  '--recurse=submodules' to your git clone command."
		echo " "
		echo "Although, if you're reading this, you've probably cloned the"
		echo "  repo, huh? Okay, try this on for size:"
		echo " "
		echo "    git submodule update --init --recursive"
		echo " "
		exit 0
	fi
	echo "Copying $3 file to css directory"
	cp -r "$1" "$2"
}

doallcopies () {
	copyfile "links/animate.css/animate.min.css"               "css/" "Animate.css"
}

if [ "$1" == "" ];
then
	doallcopies
	echo "Done. Don't forget to check the css files for any external"
	echo "  font files that might be used!"
else 
	if [ "$1" == "dist" ];
	then
		echo "making dist"
		doallcopies
		mkdir -p dist/
		cp index.html dist/
		cp -R css/ dist/
		cp -R js/ dist/
		if [ -d "img" ];
		then
			cp -R img/ dist/
		fi
		if [ -d "images" ];
		then
			cp -R images/ dist/
		fi
		echo "Done. Don't forget to check the css files for any external font files that might be used!"
	fi
fi

